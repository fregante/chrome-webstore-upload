import {
    test, assert, expect, beforeEach,
} from 'vitest';
import fetchMock from 'fetch-mock';
import getClient from './helpers/get-client.js';

function stubTokenRequest(token = 'token') {
    fetchMock.postOnce('https://www.googleapis.com/oauth2/v4/token', {
        access_token: token,
    });
}

beforeEach(context => {
    fetchMock.reset();
    context.client = getClient();
});

test('Upload fails when file stream not provided', async ({ client }) => {
    await expect(client.uploadExisting()).rejects.toThrowError('Read stream missing');
});

test('Upload only returns response body on success', async ({ client }) => {
    const body = { foo: 'bar' };

    fetchMock.putOnce('https://www.googleapis.com/upload/chromewebstore/v1.1/items/foo', body);

    stubTokenRequest();

    const response = await client.uploadExisting({});
    assert.deepEqual(response, body);
});

test('Upload does not fetch token when provided', async ({ client }) => {
    fetchMock.putOnce('https://www.googleapis.com/upload/chromewebstore/v1.1/items/foo', {});

    await client.uploadExisting({}, 'token');
});

test('Upload uses token for auth', async ({ client }) => {
    const token = 'token';

    stubTokenRequest(token);

    fetchMock.putOnce('https://www.googleapis.com/upload/chromewebstore/v1.1/items/foo', {});

    await client.uploadExisting({});
});

test('Uses provided extension ID', async ({ client }) => {
    const { extensionId } = client;

    fetchMock.putOnce(`https://www.googleapis.com/upload/chromewebstore/v1.1/items/${extensionId}`, {
        foo: 'bar',
    });

    await client.uploadExisting({}, 'token');
});
