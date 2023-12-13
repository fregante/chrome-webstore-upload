import test from 'ava';
import fetchMock from 'fetch-mock';
import { refreshTokenURI } from '../index.js';
import getClient from './helpers/get-client.js';

test.beforeEach(t => {
    t.context = {
        client: getClient(),
    };
});

test('Get uses default projection when not provided', async t => {
    t.plan(1);

    const { client } = t.context;

    const mock = fetchMock.getOnce('begin:https://www.googleapis.com', {});
    await client.get(undefined, 'token');

    t.is(
        mock.lastUrl(),
        'https://www.googleapis.com/chromewebstore/v1.1/items/foo?projection=DRAFT',
    );
});

test('Get does not fetch token when provided', async t => {
    const { client } = t.context;

    const mock = fetchMock.getOnce(/./, {});
    await client.get(undefined, 'token');
    t.false(mock.called('https://accounts.google.com/o/oauth2/token'), 'Token should not have been fetched');
});

test('Get uses token for auth', async t => {
    t.plan(1);

    const { client } = t.context;
    const token = 'token';

    const mock = fetchMock.get('begin:https://www.googleapis.com/', {});

    t.false(mock.called({
        headers: { Authorization: `Bearer ${token}` },
    }), 'Token should not have been fetched');

    await client.get(undefined, token);
});

test('Get uses provided extension ID', async t => {
    const { client } = t.context;
    const { extensionId } = client;

    fetchMock.get(`end:/items/${extensionId}`, {});

    await client.get(undefined, 'token');
    t.pass();
});
