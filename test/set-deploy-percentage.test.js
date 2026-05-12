import { test, expect, beforeEach } from 'vitest';
import fetchMock from 'fetch-mock';
import getClient from './helpers/get-client.js';

beforeEach(context => {
    fetchMock.reset();
    context.client = getClient();
});

test('setDeployPercentage calls the correct endpoint', async ({ client }) => {
    fetchMock.postOnce('https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:setPublishedDeployPercentage', {});

    await client.setDeployPercentage(50, 'token');
});

test('setDeployPercentage sends deployPercentage in request body', async ({ client }) => {
    const deployPercentage = 25;

    fetchMock.postOnce((url, options) =>
        url === 'https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:setPublishedDeployPercentage'
        && JSON.parse(options.body).deployPercentage === deployPercentage, {});

    await client.setDeployPercentage(deployPercentage, 'token');
});

test('setDeployPercentage uses token for auth', async ({ client }) => {
    const token = 'my-token';

    fetchMock.postOnce({
        url: 'https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:setPublishedDeployPercentage',
        headers: { Authorization: `Bearer ${token}` },
    }, {});

    await client.setDeployPercentage(50, token);
});

test('setDeployPercentage sends Content-Type application/json header', async ({ client }) => {
    fetchMock.postOnce({
        url: 'https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:setPublishedDeployPercentage',
        headers: { 'Content-Type': 'application/json' },
    }, {});

    await client.setDeployPercentage(50, 'token');
});

test('setDeployPercentage uses provided extension ID and publisher ID', async ({ client }) => {
    const { extensionId, publisherId } = client;

    fetchMock.postOnce(`https://chromewebstore.googleapis.com/v2/publishers/${publisherId}/items/${extensionId}:setPublishedDeployPercentage`, {});

    await client.setDeployPercentage(50, 'token');
});

test('setDeployPercentage throws CWSError on failure', async ({ client }) => {
    fetchMock.postOnce('https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:setPublishedDeployPercentage', {
        status: 400,
        body: { error: { code: 400, message: 'Deploy percentage must be higher than current value.' } },
    });

    await expect(client.setDeployPercentage(10, 'token')).rejects.toThrow('Deploy percentage must be higher than current value.');
});
