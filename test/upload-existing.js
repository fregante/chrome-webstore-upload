import test from 'ava';
import fetchMock from 'fetch-mock';
import getClient from './helpers/get-client.js';

function stubTokenRequest(token = 'token') {
    fetchMock.postOnce('https://www.googleapis.com/oauth2/v4/token', {
        access_token: token,
    });
}

test.beforeEach(t => {
    fetchMock.reset();
    t.context = {
        client: getClient(),
    };
});

test.serial('Upload fails when file stream not provided', async t => {
    const { client } = t.context;

    await t.throwsAsync(client.uploadExisting(), { message: 'Read stream missing' });
});

test.serial('Upload only returns response body on success', async t => {
    const { client } = t.context;
    const body = { foo: 'bar' };

    fetchMock.putOnce('https://www.googleapis.com/upload/chromewebstore/v1.1/items/foo', body);

    stubTokenRequest();

    const response = await client.uploadExisting({});
    t.deepEqual(response, body);
});

test.serial('Upload does not fetch token when provided', async t => {
    const { client } = t.context;

    fetchMock.putOnce('https://www.googleapis.com/upload/chromewebstore/v1.1/items/foo', {});

    await client.uploadExisting({}, 'token');
    t.pass();
});

test.serial('Upload uses token for auth', async t => {
    t.plan(0);

    const { client } = t.context;
    const token = 'token';

    stubTokenRequest(token);

    fetchMock.putOnce('https://www.googleapis.com/upload/chromewebstore/v1.1/items/foo', {});

    await client.uploadExisting({});
});

test.serial('Uses provided extension ID', async t => {
    t.plan(0);

    const { client } = t.context;
    const { extensionId } = client;

    fetchMock.putOnce(`https://www.googleapis.com/upload/chromewebstore/v1.1/items/${extensionId}`, {
        foo: 'bar',
    });

    await client.uploadExisting({}, 'token');
});
