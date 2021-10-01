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

test.serial('Get uses default projection when not provided', async t => {
    t.plan(1);

    const { client, sandbox } = t.context;
    const defaultProjection = 'DRAFT';

    sandbox.stub(got, 'get').callsFake(uri => {
        t.is(new URL(uri).searchParams.get('projection'), defaultProjection);

        return {
            json: sandbox.stub().resolves({}),
        };
    });

    await client.get(undefined, 'token');
});

test.serial('Get does not fetch token when provided', async t => {
    const { client, sandbox } = t.context;

    sandbox.stub(got, 'get').callsFake(uri => {
        if (uri === 'https://accounts.google.com/o/oauth2/token') {
            return t.fail('Token should not have been fetched');
        }

        return {
            json: sandbox.stub().resolves({}),
        };
    });

    await client.get(undefined, 'token');
    t.pass('Did not fetch token');
});

test.serial('Get uses token for auth', async t => {
    t.plan(1);

    const { client, sandbox } = t.context;
    const token = 'token';

    sandbox.stub(got, 'get').callsFake((uri, { headers }) => {
        t.is(headers.Authorization, `Bearer ${token}`);
        return {
            json: sandbox.stub().resolves({}),
        };
    });

    await client.get(undefined, token);
});

test.serial('Get uses provided extension ID', async t => {
    t.plan(1);

    const { client, sandbox } = t.context;
    const { extensionId } = client;

    sandbox.stub(got, 'get').callsFake(uri => {
        t.true(uri.includes(`/items/${extensionId}`));

        return {
            json: sandbox.stub().resolves({}),
        };
    });

    await client.get(undefined, 'token');
});
