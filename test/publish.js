import test from 'ava';
import got from 'got';
import sinon from 'sinon';
import url from 'url';
import getClient from './helpers/get-client';

test.beforeEach('Setup Sinon Sandbox', t => {
    t.context = {
        sandbox: sinon.sandbox.create(),
        client: getClient()
    }
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

    sandbox.stub(got, 'post', (uri) => {
        const { query } = url.parse(uri, true);
        t.is(query.publishTarget, defaultTarget);

        return Promise.resolve({});
    });

    await client.publish(undefined, 'token');
});

test.serial('Publish uses target when provided', async t => {
    t.plan(1);

    const { client, sandbox } = t.context;
    const target = 'trustedTesters';

    sandbox.stub(got, 'post', (uri) => {
        const { query } = url.parse(uri, true);
        t.is(query.publishTarget, target);

        return Promise.resolve({});
    });

    await client.publish(target, 'token');
});

test.serial('Publish does not fetch token when provided', async t => {
    const { client, sandbox } = t.context;

    sandbox.stub(got, 'post', (uri) => {
        if (uri === 'https://accounts.google.com/o/oauth2/token') {
            return t.fail('Token should not have been fetched');
        }

        return Promise.resolve({});
    });

    await client.publish(undefined, 'token');
    t.pass('Did not fetch token');
});

test.serial('Publish uses token for auth', async t => {
    t.plan(1);

    const { client, sandbox } = t.context;
    const token = 'token';

    sandbox.stub(got, 'post', (uri, { headers }) => {
        t.is(headers.Authorization, `Bearer ${token}`);
        return Promise.resolve({});
    });

    await client.publish(undefined, token);
});

test.serial('Uses provided extension ID', async t => {
    t.plan(1);

    const { client, sandbox } = t.context;
    const extensionId = client.extensionId;

    sandbox.stub(got, 'post', (uri) => {
        const hasId = new RegExp(`\/items\/${extensionId}`).test(uri);
        t.true(hasId);

        return Promise.resolve({});
    });

    await client.publish(undefined, 'token');
});

test.todo('Publish only returns response body on success');
