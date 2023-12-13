import test from 'ava';
import fetchMock from 'fetch-mock';
import { refreshTokenURI } from '../index.js';
import getClient from './helpers/get-client.js';

test.beforeEach(t => {
    t.context = {
        client: getClient(),
    };
});

test('Only returns token from response body', async t => {
    const { client } = t.context;
    const accessToken = 'access-token';

    fetchMock.post(refreshTokenURI, {
        access_token: accessToken,
    });

    t.is(await client.fetchToken(), accessToken);
});

test.todo('Request includes clientId, and refreshToken');
