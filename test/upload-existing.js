import test from 'ava';
import got from 'got';
import sinon from 'sinon';
import getClient from './helpers/get-client.js';

function stubTokenRequest(t, token = 'token') {
    t.context.sandbox.stub(got, 'post').returns({
        json: t.context.sandbox.stub().resolves({
            access_token: token,
        }),
    });
}

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

test.serial('Upload fails when file stream not provided', async t => {
    const { client } = t.context;

    try {
        await client.uploadExisting();
        t.fail('Did not reject promise when file stream missing');
    } catch (error) {
        t.is(error.message, 'Read stream missing');
    }
});

test.serial('Upload only returns response body on success', async t => {
    const { client, sandbox } = t.context;
    const body = { foo: 'bar' };

    sandbox.stub(got, 'put').returns({
        json: sandbox.stub().resolves(body),
    });

    stubTokenRequest(t);

    const response = await client.uploadExisting({});
    t.deepEqual(response, body);
});

test.serial('Upload does not fetch token when provided', async t => {
    const { client, sandbox } = t.context;

    sandbox.stub(got, 'post').callsFake(() => {
        t.fail('Token should not have been fetched');
    });

    sandbox.stub(got, 'put').returns({
        json: sandbox.stub().resolves({}),
    });

    await client.uploadExisting({}, 'token');
    t.pass();
});

test.serial('Upload uses token for auth', async t => {
    t.plan(1);

    const { client, sandbox } = t.context;
    const token = 'token';

    stubTokenRequest(t, token);
    sandbox.stub(got, 'put').callsFake((uri, { headers }) => {
        t.is(headers.Authorization, `Bearer ${token}`);
        return {
            json: sandbox.stub().resolves({}),
        };
    });

    await client.uploadExisting({});
});

test.serial('Uses provided extension ID', async t => {
    t.plan(1);

    const { client, sandbox } = t.context;
    const { extensionId } = client;

    sandbox.stub(got, 'put').callsFake(uri => {
        t.true(uri.includes(`/items/${extensionId}`));

        return {
            json: sandbox.stub().resolves({}),
        };
    });

    await client.uploadExisting({}, 'token');
});
