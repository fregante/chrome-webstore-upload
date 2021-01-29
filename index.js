const got = require('got');

const rootURI = 'https://www.googleapis.com';
const refreshTokenURI = 'https://www.googleapis.com/oauth2/v4/token';
const uploadExistingURI = id => `${rootURI}/upload/chromewebstore/v1.1/items/${id}`;
const publishURI = (id, target) => (
    `${rootURI}/chromewebstore/v1.1/items/${id}/publish?publishTarget=${target}`
);

const requiredFields = [
    'extensionId',
    'clientId',
    'refreshToken'
];

class APIClient {
    constructor(options) {
        requiredFields.forEach(field => {
            if (!options[field]) {
                throw new Error(`Option "${field}" is required`);
            }

            this[field] = options[field];
        });

        if ('clientSecret' in options) {
            this.clientSecret = options.clientSecret;
        }
    }

    async uploadExisting(readStream, token = this.fetchToken()) {
        if (!readStream) {
            throw new Error('Read stream missing');
        }

        const { extensionId } = this;

        return got.put(uploadExistingURI(extensionId), {
            headers: this._headers(await token),
            body: readStream
        }).json();
    }

    async publish(target = 'default', token = this.fetchToken()) {
        const { extensionId } = this;

        return got.post(publishURI(extensionId, target), {
            headers: this._headers(await token)
        }).json();
    }

    async fetchToken() {
        const { clientId, clientSecret, refreshToken } = this;

        const response = await got.post(refreshTokenURI, {
            json: {
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            }
        }).json();

        return response.access_token;
    }

    _headers(token) {
        return {
            Authorization: `Bearer ${token}`,
            'x-goog-api-version': '2'
        };
    }
}

module.exports = function (...args) {
    return new APIClient(...args);
};
