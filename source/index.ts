// API documentation:
// https://developer.chrome.com/docs/webstore/api
// https://developer.chrome.com/docs/webstore/using-api

import fs, { type ReadStream } from 'node:fs';
import { throwIfNotOk } from './errors.js';
import type {
    APIClientOptions, ItemResource, ItemStatusResponse, PublishResponse, PublishType,
} from './types.js';
import zipStreamFromDirectory from './zip-dir.js';

const rootURI = 'https://chromewebstore.googleapis.com';
export const refreshTokenURI = 'https://www.googleapis.com/oauth2/v4/token';

const itemName = (publisherId: string, extensionId: string) =>
    `publishers/${publisherId}/items/${extensionId}`;

const uploadExistingURI = (publisherId: string, extensionId: string) =>
    `${rootURI}/upload/v2/${itemName(publisherId, extensionId)}:upload`;

const publishURI = (publisherId: string, extensionId: string) =>
    `${rootURI}/v2/${itemName(publisherId, extensionId)}:publish`;

const fetchStatusURI = (publisherId: string, extensionId: string) =>
    `${rootURI}/v2/${itemName(publisherId, extensionId)}:fetchStatus`;

const setDeployPercentageURI = (publisherId: string, extensionId: string) =>
    `${rootURI}/v2/${itemName(publisherId, extensionId)}:setPublishedDeployPercentage`;

const requiredFields = ['extensionId', 'publisherId', 'clientId', 'refreshToken'] as const;

const retryIntervalSeconds = 2;

async function getStreamFromPath(filepath: string): Promise<ReadStream | NodeJS.ReadableStream> {
    const stats = await fs.promises.stat(filepath);
    return stats.isFile()
        ? fs.createReadStream(filepath)
        : zipStreamFromDirectory(filepath);
}

export type {
    APIClientOptions, ItemResource, ItemStatusResponse, PublishResponse, PublishType,
} from './types.js';
export { CWSError } from './errors.js';

class APIClient {
    extensionId: string;
    publisherId: string;
    clientId: string;
    refreshToken: string;
    clientSecret: string | undefined;

    constructor(options: APIClientOptions) {
        if (typeof fetch !== 'function') {
            throw new TypeError('`chrome-webstore-upload` requires Node.js 18.17 or newer because it relies on the global `fetch` function.');
        }

        if (typeof options !== 'object') {
            throw new TypeError('The options object is required');
        }

        for (const field of requiredFields) {
            if (!options[field]) {
                throw new Error(`Option "${field}" is required`);
            }
        }

        this.extensionId = options.extensionId;
        this.publisherId = options.publisherId;
        this.clientId = options.clientId;
        this.refreshToken = options.refreshToken;
        this.clientSecret = options.clientSecret;
    }

    async uploadExisting(
        streamOrPath: ReadStream | ReadableStream | string,
        token: string | Promise<string> = this.fetchToken(),
        maxAwaitInProgressResponseSeconds = 0,
    ): Promise<ItemResource> {
        if (!streamOrPath) {
            throw new Error('Read stream missing');
        }

        // Convert string path (file or directory) to stream
        const fileName = typeof streamOrPath === 'string' && streamOrPath.endsWith('.crx') ? 'extension.crx' : 'extension.zip';
        const readStream: ReadStream | ReadableStream | NodeJS.ReadableStream = typeof streamOrPath === 'string'
            ? await getStreamFromPath(streamOrPath)
            : streamOrPath;

        const { extensionId, publisherId } = this;

        const request = await fetch(uploadExistingURI(publisherId, extensionId), {
            method: 'POST',
            headers: this._uploadHeaders(await token, fileName),
            // @ts-expect-error Node extension? 🤷‍♂️ Required https://github.com/nodejs/node/issues/46221
            duplex: 'half',

            // Until they figure it out, this seems to work. Alternatively use https://stackoverflow.com/a/76780381/288906
            body: readStream as unknown as ReadableStream,
        });

        const response = await request.json() as ItemResource;

        throwIfNotOk(request, response);

        return this._waitUploadSuccess(response, maxAwaitInProgressResponseSeconds);
    }

    async publish(
        publishType: PublishType | 'default' | 'trustedTesters' = 'DEFAULT_PUBLISH',
        token: string | Promise<string> = this.fetchToken(),
        deployPercentage: number | undefined = undefined,
    ): Promise<PublishResponse> {
        const { extensionId, publisherId } = this;

        const body: {
            publishType: PublishType;
            deployInfos?: Array<{ deployPercentage: number }>;
        } = {
            publishType: this._normalizePublishType(publishType),
        };

        if (deployPercentage !== undefined) {
            body.deployInfos = [{ deployPercentage }];
        }

        const request = await fetch(publishURI(publisherId, extensionId), {
            method: 'POST',
            headers: {
                ...this._headers(await token),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const response = await request.json() as PublishResponse;

        throwIfNotOk(request, response);

        return response;
    }

    async setDeployPercentage(
        deployPercentage: number,
        token: string | Promise<string> = this.fetchToken(),
    ): Promise<void> {
        const { extensionId, publisherId } = this;

        const request = await fetch(setDeployPercentageURI(publisherId, extensionId), {
            method: 'POST',
            headers: {
                ...this._headers(await token),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deployPercentage }),
        });

        const response = await request.json() as unknown;

        throwIfNotOk(request, response);
    }

    async get(token: string | Promise<string> = this.fetchToken()): Promise<ItemStatusResponse> {
        const { extensionId, publisherId } = this;

        const request = await fetch(fetchStatusURI(publisherId, extensionId), {
            method: 'GET',
            headers: this._headers(await token),
        });

        const response = await request.json() as ItemStatusResponse;

        throwIfNotOk(request, response);

        return response;
    }

    async fetchToken(): Promise<string> {
        const { clientId, clientSecret, refreshToken } = this;
        const json = {
            client_id: clientId,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
            client_secret: clientSecret,
        };

        if (!clientSecret) {
            delete json.client_secret;
        }

        const request = await fetch(refreshTokenURI, {
            method: 'POST',
            body: JSON.stringify(json),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const response = await request.json() as { access_token: string };
        throwIfNotOk(request, response);
        return response.access_token;
    }

    async _waitUploadSuccess(
        response: ItemResource,
        maxAwaitInProgressResponseSeconds: number,
    ): Promise<ItemResource> {
        if (response.uploadState !== 'UPLOAD_IN_PROGRESS' || maxAwaitInProgressResponseSeconds < retryIntervalSeconds) {
            return response;
        }

        // Wait before checking again
        await new Promise(resolve => {
            setTimeout(resolve, retryIntervalSeconds * 1000);
        });

        // Retry fetching the item resource
        const statusResponse = await this.get();
        const retryResponse: ItemResource = {
            crxVersion: response.crxVersion,
            itemId: response.itemId,
            name: response.name,
            uploadState: statusResponse.lastAsyncUploadState,
        };
        return this._waitUploadSuccess(retryResponse, maxAwaitInProgressResponseSeconds - retryIntervalSeconds);
    }

    _normalizePublishType(target: PublishType | 'default' | 'trustedTesters'): PublishType {
        if (target === 'default') {
            return 'DEFAULT_PUBLISH';
        }

        if (target === 'trustedTesters') {
            return 'TRUSTED_TESTERS';
        }

        return target;
    }

    _headers(token: string): { Authorization: string } {
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    _uploadHeaders(token: string, fileName: string): {
        Authorization: string;
        'X-Goog-Upload-Protocol': string;
        'X-Goog-Upload-File-Name': string;
    } {
        return {
            ...this._headers(token),
            'X-Goog-Upload-Protocol': 'raw',
            'X-Goog-Upload-File-Name': fileName,
        };
    }
}

export default function chromeWebstoreUpload(options: APIClientOptions) {
    return new APIClient(options);
}
