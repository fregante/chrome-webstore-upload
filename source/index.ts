// API documentation:
// https://developer.chrome.com/docs/webstore/api
// https://developer.chrome.com/docs/webstore/using-api

import { type ReadStream } from 'node:fs';

const rootURI = 'https://www.googleapis.com';
export const refreshTokenURI = 'https://www.googleapis.com/oauth2/v4/token';
const uploadExistingURI = (id: string) =>
    `${rootURI}/upload/chromewebstore/v1.1/items/${id}`;

const publishURI = ({ extensionId, target = 'default', deployPercentage }: {
    extensionId: string;
    target: string;
    deployPercentage?: number;
}): string => {
    const url = new URL(`${rootURI}/chromewebstore/v1.1/items/${extensionId}/publish`);
    url.searchParams.set('publishTarget', target);
    if (deployPercentage !== undefined) {
        url.searchParams.set('deployPercentage', String(deployPercentage));
    }

    return url.href;
};

const getURI = (id: string, projection: string) => `${rootURI}/chromewebstore/v1.1/items/${id}?projection=${projection}`;

const requiredFields = ['extensionId', 'clientId', 'refreshToken'] as const;

const retryIntervalSeconds = 2;

export type APIClientOptions = {
    extensionId: string;
    clientId: string;
    refreshToken: string;
    clientSecret: string | undefined;
};

export type ItemResource = {
    kind: 'chromewebstore#item';
    id: string;
    publicKey: string;
    uploadState: 'FAILURE' | 'IN_PROGRESS' | 'NOT_FOUND' | 'SUCCESS';
    itemError: Array<{
        error_code: string;
        error_detail: string;
    }>;
};

export type PublishResponse = {
    kind: 'chromewebstore#item';
    item_id: string;
    status: Array<
    | 'OK'
    | 'NOT_AUTHORIZED'
    | 'INVALID_DEVELOPER'
    | 'DEVELOPER_NO_OWNERSHIP'
    | 'DEVELOPER_SUSPENDED'
    | 'ITEM_NOT_FOUND'
    | 'ITEM_PENDING_REVIEW'
    | 'ITEM_TAKEN_DOWN'
    | 'PUBLISHER_SUSPENDED'
    >;
    statusDetail: string[];
};

function throwIfNotOk(request: Response, response: unknown) {
    if (!request.ok) {
        const error = new Error(request.statusText ?? 'Unknown error');
        (error as any).response = response;
        throw error;
    }
}

class APIClient {
    extensionId: string;
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
        this.clientId = options.clientId;
        this.refreshToken = options.refreshToken;
        this.clientSecret = options.clientSecret;
    }

    async uploadExisting(
        readStream: ReadStream | ReadableStream,
        token: string | Promise<string> = this.fetchToken(),
        maxAwaitInProgressResponseSeconds = 60,
    ): Promise<ItemResource> {
        if (!readStream) {
            throw new Error('Read stream missing');
        }

        const { extensionId } = this;

        const request = await fetch(uploadExistingURI(extensionId), {
            method: 'PUT',
            headers: this._headers(await token),
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
        target = 'default',
        token: string | Promise<string> = this.fetchToken(),
        deployPercentage: number | undefined = undefined,
    ): Promise<PublishResponse> {
        const { extensionId } = this;

        const request = await fetch(publishURI({ extensionId, target, deployPercentage }), {
            method: 'POST',
            headers: this._headers(await token),
        });

        const response = await request.json() as PublishResponse;

        throwIfNotOk(request, response);

        return response;
    }

    async get(projection = 'DRAFT', token: string | Promise<string> = this.fetchToken()): Promise<ItemResource> {
        const { extensionId } = this;

        const request = await fetch(getURI(extensionId, projection), {
            method: 'GET',
            headers: this._headers(await token),
        });

        const response = await request.json() as ItemResource;

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
        if (response.uploadState !== 'IN_PROGRESS' || maxAwaitInProgressResponseSeconds < retryIntervalSeconds) {
            return response;
        }

        // Wait before checking again
        await new Promise(resolve => {
            setTimeout(resolve, retryIntervalSeconds * 1000);
        });

        // Retry fetching the item resource
        return this._waitUploadSuccess(await this.get('DRAFT'), maxAwaitInProgressResponseSeconds - retryIntervalSeconds);
    }

    _headers(token: string): { Authorization: string; 'x-goog-api-version': string } {
        return {
            Authorization: `Bearer ${token}`,
            'x-goog-api-version': '2',
        };
    }
}

export default function chromeWebstoreUpload(options: APIClientOptions) {
    return new APIClient(options);
}
