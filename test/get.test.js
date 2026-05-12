import { test, assert, beforeEach } from 'vitest';
import fetchMock from 'fetch-mock';
import getClient from './helpers/get-client.js';

beforeEach(context => {
    fetchMock.reset();
    context.client = getClient();
});

test('Get uses fetchStatus endpoint', async ({ client }) => {
    const mock = fetchMock.getOnce('begin:https://chromewebstore.googleapis.com', {});
    await client.get('token');

    assert.equal(
        mock.lastUrl(),
        'https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:fetchStatus',
    );
});

test('Get does not fetch token when provided', async ({ client }) => {
    fetchMock.getOnce('begin:https://chromewebstore.googleapis.com', {});
    await client.get('token');
});

test('Get uses token for auth', async ({ client }) => {
    const token = 'token';

    fetchMock.getOnce({
        url: 'begin:https://chromewebstore.googleapis.com/',
        headers: { Authorization: `Bearer ${token}` },
    }, {});

    await client.get(token);
});

test('Get uses provided extension ID and publisher ID', async ({ client }) => {
    const { extensionId, publisherId } = client;

    fetchMock.getOnce(`https://chromewebstore.googleapis.com/v2/publishers/${publisherId}/items/${extensionId}:fetchStatus`, {});

    await client.get('token');
});
