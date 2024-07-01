// API documentation:
// https://developer.chrome.com/docs/webstore/api
// https://developer.chrome.com/docs/webstore/using-api

import { type JsonObject } from 'type-fest';

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
    if (deployPercentage) {
        url.searchParams.set('deployPercentage', String(deployPercentage));
    }

    return url.href;
};

const getURI = (id: string, projection: string) => `${rootURI}/chromewebstore/v1.1/items/${id}?projection=${projection}`;

const requiredFields = ['extensionId', 'clientId', 'refreshToken'] as const;

export type APIClientOptions = {
    extensionId: string;
    clientId: string;
    refreshToken: string;
    clientSecret: string | undefined;
    fetch?: typeof fetch;
};

function throwIfNotOk(request: Response, response: JsonObject) {
    if (!request.ok) {
        const error = new Error(request.statusText ?? 'Unknown error');
        (error as any).response = response;
        throw error;
    }
}

class APIClient {
    private extensionId: string;
    private clientId: string;
    private refreshToken: string;
    private clientSecret: string | undefined;
    private fetch: typeof fetch;

    constructor(options: APIClientOptions) {
        if (typeof options !== 'object') {
            throw new TypeError('The options object is required');
        }

        if (typeof options.fetch !== 'function' && typeof fetch !== 'function') {
            throw new TypeError('`chrome-webstore-upload` requires a `fetch` function. Ensure your environment includes a global `fetch` function or provide `options.fetch`.');
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
        this.fetch = options.fetch ?? fetch;
    }

    async uploadExisting(readStream: ReadableStream, token = this.fetchToken()): Promise<JsonObject> {
        if (!readStream) {
            throw new Error('Read stream missing');
        }

        const { extensionId } = this;

        const request = await this.fetch(uploadExistingURI(extensionId), {
            method: 'PUT',
            headers: this._headers(await token),
            // @ts-expect-error Node extension? 🤷‍♂️ Required https://github.com/nodejs/node/issues/46221
            duplex: 'half',
            body: readStream,
        });

        const response = await request.json() as JsonObject;

        throwIfNotOk(request, response);

        return response;
    }

    async publish(
        target = 'default',
        token = this.fetchToken(),
        deployPercentage: number | undefined = undefined,
    ): Promise<JsonObject> {
        const { extensionId } = this;

        const request = await this.fetch(publishURI({ extensionId, target, deployPercentage }), {
            method: 'POST',
            headers: this._headers(await token),
        });

        const response = await request.json() as JsonObject;

        throwIfNotOk(request, response);

        return response;
    }

    async get(projection = 'DRAFT', token = this.fetchToken()): Promise<JsonObject> {
        const { extensionId } = this;

        const request = await this.fetch(getURI(extensionId, projection), {
            method: 'GET',
            headers: this._headers(await token),
        });

        const response = await request.json() as JsonObject;

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

        const request = await this.fetch(refreshTokenURI, {
            method: 'POST',
            body: JSON.stringify(json),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const response = await request.json() as JsonObject;
        throwIfNotOk(request, response);

        return response['access_token'] as string;
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
