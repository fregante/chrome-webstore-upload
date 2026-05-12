import {
    test, assert, expect, beforeEach, vi, afterEach,
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
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

test('Upload fails when file stream not provided', async ({ client }) => {
    await expect(client.uploadExisting()).rejects.toThrowError('Read stream missing');
});

test('Upload only returns response body on success', async ({ client }) => {
    const body = { foo: 'bar' };

    fetchMock.postOnce('https://chromewebstore.googleapis.com/upload/v2/publishers/test-publisher/items/foo:upload', body);

    stubTokenRequest();

    const response = await client.uploadExisting({});
    assert.deepEqual(response, body);
});

test('Upload does not fetch token when provided', async ({ client }) => {
    fetchMock.postOnce('https://chromewebstore.googleapis.com/upload/v2/publishers/test-publisher/items/foo:upload', {});

    await client.uploadExisting({}, 'token');
});

test('Upload uses token for auth', async ({ client }) => {
    const token = 'token';

    stubTokenRequest(token);

    fetchMock.postOnce('https://chromewebstore.googleapis.com/upload/v2/publishers/test-publisher/items/foo:upload', {});

    await client.uploadExisting({});
});

test('Uses provided extension ID and publisher ID', async ({ client }) => {
    const { extensionId, publisherId } = client;

    fetchMock.postOnce(`https://chromewebstore.googleapis.com/upload/v2/publishers/${publisherId}/items/${extensionId}:upload`, {
        foo: 'bar',
    });

    await client.uploadExisting({}, 'token');
});

test('Upload retries if response returns IN_PROGRESS', async ({ client }) => {
    const bodyInProgress = { uploadState: 'IN_PROGRESS' };

    fetchMock.postOnce('https://chromewebstore.googleapis.com/upload/v2/publishers/test-publisher/items/foo:upload', {
        ...bodyInProgress,
    });
    stubTokenRequest();

    const getSpy = vi.spyOn(client, 'get')
        .mockImplementationOnce(async () => ({ lastAsyncUploadState: 'IN_PROGRESS' }))
        .mockImplementationOnce(async () => ({ lastAsyncUploadState: 'SUCCEEDED' }));
    const uploadPromise = client.uploadExisting({}, undefined, 6);
    await vi.advanceTimersByTimeAsync(2000); // Wait for the first retry
    expect(getSpy).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(4000); // Wait for the second retry
    const response = await uploadPromise;
    assert.equal(response.uploadState, 'SUCCEEDED');
    expect(getSpy).toHaveBeenCalledTimes(2);
});

test('Upload accepts directory path and zips it', async ({ client }) => {
    fetchMock.postOnce('https://chromewebstore.googleapis.com/upload/v2/publishers/test-publisher/items/foo:upload', {
        uploadState: 'SUCCEEDED',
    });

    stubTokenRequest();

    const response = await client.uploadExisting('./test/fixtures/valid-extension');
    assert.equal(response.uploadState, 'SUCCEEDED');
});

test('Upload rejects invalid directory path', async ({ client }) => {
    stubTokenRequest();

    await expect(client.uploadExisting('./non-existent-directory')).rejects.toThrow();
});

test('Upload accepts .crx file path', async ({ client }) => {
    fetchMock.postOnce('https://chromewebstore.googleapis.com/upload/v2/publishers/test-publisher/items/foo:upload', {
        uploadState: 'SUCCEEDED',
    });

    stubTokenRequest();

    const response = await client.uploadExisting('./test/fixtures/test.crx');
    assert.equal(response.uploadState, 'SUCCEEDED');
});

test('Upload includes X-Goog-Upload-Protocol header', async ({ client }) => {
    fetchMock.postOnce('https://chromewebstore.googleapis.com/upload/v2/publishers/test-publisher/items/foo:upload', {
        uploadState: 'SUCCEEDED',
    });

    stubTokenRequest();

    await client.uploadExisting('./test/fixtures/test.crx');

    const calls = fetchMock.calls('https://chromewebstore.googleapis.com/upload/v2/publishers/test-publisher/items/foo:upload');
    const { headers } = calls[0][1];
    assert.equal(headers['X-Goog-Upload-Protocol'], 'raw');
});

test('Upload includes X-Goog-Upload-File-Name header with file name from .crx file', async ({ client }) => {
    fetchMock.postOnce('https://chromewebstore.googleapis.com/upload/v2/publishers/test-publisher/items/foo:upload', {
        uploadState: 'SUCCEEDED',
    });

    stubTokenRequest();

    await client.uploadExisting('./test/fixtures/test.crx');

    const calls = fetchMock.calls('https://chromewebstore.googleapis.com/upload/v2/publishers/test-publisher/items/foo:upload');
    const { headers } = calls[0][1];
    assert.equal(headers['X-Goog-Upload-File-Name'], 'extension.crx');
});

test('Upload includes X-Goog-Upload-File-Name header with extension.zip for directory', async ({ client }) => {
    fetchMock.postOnce('https://chromewebstore.googleapis.com/upload/v2/publishers/test-publisher/items/foo:upload', {
        uploadState: 'SUCCEEDED',
    });

    stubTokenRequest();

    await client.uploadExisting('./test/fixtures/valid-extension');

    const calls = fetchMock.calls('https://chromewebstore.googleapis.com/upload/v2/publishers/test-publisher/items/foo:upload');
    const { headers } = calls[0][1];
    assert.equal(headers['X-Goog-Upload-File-Name'], 'extension.zip');
});

test('Upload includes X-Goog-Upload-File-Name header with extension.zip for stream', async ({ client }) => {
    fetchMock.postOnce('https://chromewebstore.googleapis.com/upload/v2/publishers/test-publisher/items/foo:upload', {
        uploadState: 'SUCCEEDED',
    });

    stubTokenRequest();

    await client.uploadExisting({});

    const calls = fetchMock.calls('https://chromewebstore.googleapis.com/upload/v2/publishers/test-publisher/items/foo:upload');
    const { headers } = calls[0][1];
    assert.equal(headers['X-Goog-Upload-File-Name'], 'extension.zip');
});
