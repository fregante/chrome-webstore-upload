import got from 'got';

const rootURI = 'https://www.googleapis.com';
const refreshTokenURI = 'https://www.googleapis.com/oauth2/v4/token';
const uploadExistingURI = id =>
    `${rootURI}/upload/chromewebstore/v1.1/items/${id}`;
const publishURI = (id, target) =>
    `${rootURI}/chromewebstore/v1.1/items/${id}/publish?publishTarget=${target}`;
const getURI = (id, projection) =>
    `${rootURI}/chromewebstore/v1.1/items/${id}?projection=${projection}`;

const requiredFields = ['extensionId', 'clientId', 'refreshToken'];

class APIClient {
    constructor(options) {
        for (const field of requiredFields) {
            if (!options[field]) {
                throw new Error(`Option "${field}" is required`);
            }

            this[field] = options[field];
        }

        if ('clientSecret' in options) {
            this.clientSecret = options.clientSecret;
        }
    }

    async uploadExisting(readStream, token = this.fetchToken()) {
        if (!readStream) {
            throw new Error('Read stream missing');
        }

        const { extensionId } = this;

        return got
            .put(uploadExistingURI(extensionId), {
                headers: this._headers(await token),
                body: readStream,
            })
            .json();
    }

    async publish(target = 'default', token = this.fetchToken()) {
        const { extensionId } = this;

        return got
            .post(publishURI(extensionId, target), {
                headers: this._headers(await token),
            })
            .json();
    }

    async get(projection = 'DRAFT', token = this.fetchToken()) {
        const { extensionId } = this;

        return got
            .get(getURI(extensionId, projection), {
                headers: this._headers(await token),
            })
            .json();
    }

    async fetchToken() {
        const { clientId, clientSecret, refreshToken } = this;
        const json = {
            client_id: clientId,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        };

        if (clientSecret) {
            json.client_secret = clientSecret;
        }

        const response = await got.post(refreshTokenURI, { json }).json();

        return response.access_token;
    }

    _headers(token) {
        return {
            Authorization: `Bearer ${token}`,
            'x-goog-api-version': '2',
        };
    }
}

export default function chromeWebstoreUpload(...args) {
    return new APIClient(...args);
}
