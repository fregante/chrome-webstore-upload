import test from 'ava';
import got from 'got';
import sinon from 'sinon';
import getClient from './helpers/get-client';

function stubTokenRequest(t, token = 'token') {
    t.context.sandbox.stub(got, 'post').returns(Promise.resolve({
        body: { access_token: token }
    }));
}

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

test.serial('Upload fails when file stream not provided', async t => {
    const { client } = t.context;

    try {
        await client.uploadExisting();
        t.fail('Did not reject promise when file stream missing');
    } catch(err) {
        t.is(err.message, 'Read stream missing');
    }
});

test.serial('Upload only returns response body on success', async t => {
    const { client, sandbox } = t.context;
    const body = { foo: 'bar' };

    sandbox.stub(got, 'put').returns(Promise.resolve({ body }));
    stubTokenRequest(t);

    const res = await client.uploadExisting({});
    t.deepEqual(res, body);
});

test.serial('Upload does not fetch token when provided', async t => {
    const { client, sandbox } = t.context;

    sandbox.stub(got, 'post', () => {
        t.fail('Token should not have been fetched');
    });

    sandbox.stub(got, 'put').returns(Promise.resolve({}));

    await client.uploadExisting({}, 'token');
    t.pass();
});

test.serial('Upload uses token for auth', async t => {
    t.plan(1);

    const { client, sandbox } = t.context;
    const token = 'token';

    stubTokenRequest(t, token);
    sandbox.stub(got, 'put', (uri, { headers }) => {
        t.is(headers.Authorization, `Bearer ${token}`);
        return Promise.resolve({});
    });

    await client.uploadExisting({});
});
