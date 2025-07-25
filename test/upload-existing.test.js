import {
    test, assert, expect, beforeEach, vi,
} from 'vitest';
import fetchMock from 'fetch-mock';
import getClient from './helpers/get-client.js';

function stubTokenRequest(token = 'token') {
    fetchMock.post('https://www.googleapis.com/oauth2/v4/token', {
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

test('Upload retries if response returns IN_PROGRESS', async ({ client }) => {
    const bodyInProgress = { uploadState: 'IN_PROGRESS' };
    const bodySuccess = { uploadState: 'SUCCESS' };

    fetchMock.putOnce('https://www.googleapis.com/upload/chromewebstore/v1.1/items/foo', {
        ...bodyInProgress,
    });
    stubTokenRequest();

    const getSpy = vi.spyOn(client, 'get')
        .mockImplementationOnce(() => Promise.resolve(bodyInProgress))
        .mockImplementationOnce(() => Promise.resolve(bodySuccess));
    const waitSpy = vi.spyOn(client, '_wait').mockImplementation(() => Promise.resolve());
    const uploadPromise = client.uploadExisting({}, undefined, 2);

    const response = await uploadPromise;
    assert.deepEqual(response, bodySuccess);
    expect(waitSpy).toHaveBeenCalledTimes(2);
    expect(getSpy).toHaveBeenCalledTimes(2);
});
