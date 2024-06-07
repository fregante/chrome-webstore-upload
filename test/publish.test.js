import { test, beforeEach } from 'vitest';
import fetchMock from 'fetch-mock';
import getClient from './helpers/get-client.js';

beforeEach(context => {
    fetchMock.reset();
    context.client = getClient();
});

test('Publish uses default target when not provided', async ({ client }) => {
    fetchMock.postOnce('https://www.googleapis.com/chromewebstore/v1.1/items/foo/publish?publishTarget=default', {});

    await client.publish(undefined, 'token');
});

test('Publish uses target when provided', async ({ client }) => {
    const target = 'trustedTesters';

    fetchMock.postOnce(`https://www.googleapis.com/chromewebstore/v1.1/items/foo/publish?publishTarget=${target}`, {});

    await client.publish(target, 'token');
});

test('Publish uses deployPercentage when provided', async ({ client }) => {
    const deployPercentage = 100;

    fetchMock.postOnce(`https://www.googleapis.com/chromewebstore/v1.1/items/foo/publish?publishTarget=default&deployPercentage=${deployPercentage}`, {});

    await client.publish('default', 'token', deployPercentage);
});

test('Publish does not fetch token when provided', async ({ client }) => {
    fetchMock.postOnce('https://www.googleapis.com/chromewebstore/v1.1/items/foo/publish?publishTarget=default', {});

    await client.publish(undefined, 'token');
});

test('Publish uses token for auth', async ({ client }) => {
    const token = 'token';

    fetchMock.postOnce({
        url: 'https://www.googleapis.com/chromewebstore/v1.1/items/foo/publish?publishTarget=default',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }, {});

    await client.publish(undefined, token);
});

test('Uses provided extension ID', async ({ client }) => {
    const { extensionId } = client;

    // Sandbox.stub(got, 'post').callsFake(uri => {
    //     t.true(uri.includes(`/items/${extensionId}`));

    //     return {
    //         json: sandbox.stub().resolves({}),
    //     };
    // });

    fetchMock.postOnce(`https://www.googleapis.com/chromewebstore/v1.1/items/${extensionId}/publish?publishTarget=default`, {});

    await client.publish(undefined, 'token');
});

test.todo('Publish only returns response body on success');
