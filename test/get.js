import test from 'ava';
import fetchMock from 'fetch-mock';
import getClient from './helpers/get-client.js';

test.beforeEach(t => {
    fetchMock.reset();
    t.context = {
        client: getClient(),
    };
});

test('Get uses default projection when not provided', async t => {
    const { client } = t.context;

    const mock = fetchMock.getOnce('begin:https://www.googleapis.com', {});
    await client.get(undefined, 'token');

    t.is(
        mock.lastUrl(),
        'https://www.googleapis.com/chromewebstore/v1.1/items/foo?projection=DRAFT',
    );
});

test('Get does not fetch token when provided', async t => {
    t.plan(0);
    const { client } = t.context;

    fetchMock.getOnce('begin:https://www.googleapis.com/chromewebstore/v1.1/items/', {});
    await client.get(undefined, 'token');
});

test('Get uses token for auth', async t => {
    t.plan(0);

    const { client } = t.context;
    const token = 'token';

    fetchMock.getOnce({
        url: 'begin:https://www.googleapis.com/',
        headers: { Authorization: `Bearer ${token}` },
    }, {});

    await client.get(undefined, token);
});

test('Get uses provided extension ID', async t => {
    const { client } = t.context;
    const { extensionId } = client;

    fetchMock.getOnce(`path:/chromewebstore/v1.1/items/${extensionId}`, {});

    await client.get(undefined, 'token');
    t.pass();
});
