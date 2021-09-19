import test from 'ava';
import got from 'got';
import sinon from 'sinon';
import getClient from './helpers/get-client.js';

test.beforeEach('Setup Sinon Sandbox', t => {
    t.context = {
        sandbox: sinon.createSandbox(),
        client: getClient(),
    };
});

test.afterEach('Reset Sinon Sandbox', t => {
    t.context.sandbox.restore();
});

// TODO: Find a better way of handling stubbing, to eliminate the need
// to run tests serially - https://github.com/avajs/ava/issues/295#issuecomment-161123805

test.serial('Publish uses default target when not provided', async t => {
    t.plan(1);

    const { client, sandbox } = t.context;
    const defaultTarget = 'default';

    sandbox.stub(got, 'post').callsFake(uri => {
        t.is(new URL(uri).searchParams.get('publishTarget'), defaultTarget);

        return {
            json: sandbox.stub().resolves({}),
        };
    });

    await client.publish(undefined, 'token');
});

test.serial('Publish uses target when provided', async t => {
    t.plan(1);

    const { client, sandbox } = t.context;
    const target = 'trustedTesters';

    sandbox.stub(got, 'post').callsFake(uri => {
        t.is(new URL(uri).searchParams.get('publishTarget'), target);

        return {
            json: sandbox.stub().resolves({}),
        };
    });

    await client.publish(target, 'token');
});

test.serial('Publish does not fetch token when provided', async t => {
    const { client, sandbox } = t.context;

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

test.serial('Publish uses token for auth', async t => {
    t.plan(1);

    const { client, sandbox } = t.context;
    const token = 'token';

    sandbox.stub(got, 'post').callsFake((uri, { headers }) => {
        t.is(headers.Authorization, `Bearer ${token}`);
        return {
            json: sandbox.stub().resolves({}),
        };
    });

    await client.publish(undefined, token);
});

test.serial('Uses provided extension ID', async t => {
    t.plan(1);

    const { client, sandbox } = t.context;
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
