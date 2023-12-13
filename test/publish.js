import test from 'ava';
import fetchMock from 'fetch-mock';
import getClient from './helpers/get-client.js';

test.beforeEach(t => {
    t.context = {
        client: getClient(),
    };
});

test('Publish uses default target when not provided', async t => {
    t.plan(1);

    const { client } = t.context;
    const defaultTarget = 'default';

    sandbox.stub(got, 'post').callsFake(uri => {
        t.is(new URL(uri).searchParams.get('publishTarget'), defaultTarget);

        return {
            json: sandbox.stub().resolves({}),
        };
    });

    await client.publish(undefined, 'token');
});

test('Publish uses target when provided', async t => {
    t.plan(1);

    const { client } = t.context;
    const target = 'trustedTesters';

    sandbox.stub(got, 'post').callsFake(uri => {
        t.is(new URL(uri).searchParams.get('publishTarget'), target);

        return {
            json: sandbox.stub().resolves({}),
        };
    });

    await client.publish(target, 'token');
});

test('Publish does not fetch token when provided', async t => {
    const { client } = t.context;

    sandbox.stub(got, 'post').callsFake(uri => {
        if (uri === 'https://accounts.google.com/o/oauth2/token') {
            return t.fail('Token should not have been fetched');
        }

        return {
            json: sandbox.stub().resolves({}),
        };
    });

    await client.publish(undefined, 'token');
    t.pass('Did not fetch token');
});

test('Publish uses token for auth', async t => {
    t.plan(1);

    const { client } = t.context;
    const token = 'token';

    sandbox.stub(got, 'post').callsFake((uri, { headers }) => {
        t.is(headers.Authorization, `Bearer ${token}`);
        return {
            json: sandbox.stub().resolves({}),
        };
    });

    await client.publish(undefined, token);
});

test('Uses provided extension ID', async t => {
    t.plan(1);

    const { client } = t.context;
    const { extensionId } = client;

    sandbox.stub(got, 'post').callsFake(uri => {
        t.true(uri.includes(`/items/${extensionId}`));

        return {
            json: sandbox.stub().resolves({}),
        };
    });

    await client.publish(undefined, 'token');
});

test.todo('Publish only returns response body on success');
