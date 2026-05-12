import { test, beforeEach } from 'vitest';
import fetchMock from 'fetch-mock';
import getClient from './helpers/get-client.js';

beforeEach(context => {
    fetchMock.reset();
    context.client = getClient();
});

test('Publish uses default publishType when not provided', async ({ client }) => {
    fetchMock.postOnce((url, options) =>
        url === 'https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:publish'
        && JSON.parse(options.body).publishType === 'DEFAULT_PUBLISH', {});

    await client.publish(undefined, 'token');
});

test('Publish uses DEFAULT_PUBLISH publishType', async ({ client }) => {
    fetchMock.postOnce((url, options) =>
        url === 'https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:publish'
        && JSON.parse(options.body).publishType === 'DEFAULT_PUBLISH', {});

    await client.publish('DEFAULT_PUBLISH', 'token');
});

test('Publish uses TRUSTED_TESTERS publishType', async ({ client }) => {
    fetchMock.postOnce((url, options) =>
        url === 'https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:publish'
        && JSON.parse(options.body).publishType === 'TRUSTED_TESTERS', {});

    await client.publish('TRUSTED_TESTERS', 'token');
});

test('Publish maps legacy "default" target to DEFAULT_PUBLISH', async ({ client }) => {
    fetchMock.postOnce((url, options) =>
        url === 'https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:publish'
        && JSON.parse(options.body).publishType === 'DEFAULT_PUBLISH', {});

    await client.publish('default', 'token');
});

test('Publish maps legacy "trustedTesters" target to TRUSTED_TESTERS', async ({ client }) => {
    fetchMock.postOnce((url, options) =>
        url === 'https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:publish'
        && JSON.parse(options.body).publishType === 'TRUSTED_TESTERS', {});

    await client.publish('trustedTesters', 'token');
});

test('Publish sends deployInfos when deployPercentage is provided', async ({ client }) => {
    const deployPercentage = 25;

    fetchMock.postOnce((url, options) => {
        const body = JSON.parse(options.body);
        return url === 'https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:publish'
            && Array.isArray(body.deployInfos)
            && body.deployInfos[0].deployPercentage === deployPercentage;
    }, {});

    await client.publish('DEFAULT_PUBLISH', 'token', deployPercentage);
});

test('Publish does not send deployInfos when deployPercentage is not provided', async ({ client }) => {
    fetchMock.postOnce((url, options) => {
        const body = JSON.parse(options.body);
        return url === 'https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:publish'
            && body.deployInfos === undefined;
    }, {});

    await client.publish(undefined, 'token');
});

test('Publish does not fetch token when provided', async ({ client }) => {
    fetchMock.postOnce('https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:publish', {});

    await client.publish(undefined, 'token');
});

test('Publish uses token for auth', async ({ client }) => {
    const token = 'token';

    fetchMock.postOnce({
        url: 'https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:publish',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }, {});

    await client.publish(undefined, token);
});

test('Publish uses provided extension ID and publisher ID', async ({ client }) => {
    const { extensionId, publisherId } = client;

    fetchMock.postOnce(`https://chromewebstore.googleapis.com/v2/publishers/${publisherId}/items/${extensionId}:publish`, {});

    await client.publish(undefined, 'token');
});

test('Publish sends Content-Type application/json header', async ({ client }) => {
    fetchMock.postOnce({
        url: 'https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:publish',
        headers: {
            'Content-Type': 'application/json',
        },
    }, {});

    await client.publish(undefined, 'token');
});

test.todo('Publish only returns response body on success');
