import test from 'ava';
import fetchMock from 'fetch-mock';
import getClient from './helpers/get-client.js';

test.beforeEach(t => {
    fetchMock.reset();
    t.context = {
        client: getClient(),
    };
});

test.serial('Publish uses default target when not provided', async t => {
    t.plan(0);
    const { client } = t.context;
    fetchMock.postOnce('https://www.googleapis.com/chromewebstore/v1.1/items/foo/publish?publishTarget=default', {});

    await client.publish(undefined, 'token');
});

test.serial('Publish uses target when provided', async t => {
    t.plan(0);
    const { client } = t.context;
    const target = 'trustedTesters';

    fetchMock.postOnce(`https://www.googleapis.com/chromewebstore/v1.1/items/foo/publish?publishTarget=${target}`, {});

    await client.publish(target, 'token');
});

test.serial('Publish does not fetch token when provided', async t => {
    t.plan(0);
    const { client } = t.context;

    fetchMock.postOnce('https://www.googleapis.com/chromewebstore/v1.1/items/foo/publish?publishTarget=default', {});

    await client.publish(undefined, 'token');
});

test.serial('Publish uses token for auth', async t => {
    t.plan(0);

    const { client } = t.context;
    const token = 'token';

    fetchMock.postOnce({
        url: 'https://www.googleapis.com/chromewebstore/v1.1/items/foo/publish?publishTarget=default',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }, {});

    await client.publish(undefined, token);
});

test.serial('Uses provided extension ID', async t => {
    t.plan(0);

    const { client } = t.context;
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
