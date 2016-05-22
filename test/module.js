import test from 'ava';
import got from 'got';
import sinon from 'sinon';
import webStoreUpload from '../';

function getClient() {
    return webStoreUpload({
        extensionId: 'foo',
        clientId: 'bar',
        clientSecret: 'foobar',
        refreshToken: 'heyhey'
    });
}

function stubTokenRequest(t) {
    t.context.sandbox.stub(got, 'post', () => {
        return Promise.resolve({ body: {
            access_token: 'token'
        }});
    });
}

test.beforeEach('Setup Sinon Sandbox', t => {
    t.context.sandbox = sinon.sandbox.create();
});

test.afterEach('Reset Sinon Sandbox', t => {
    t.context.sandbox.restore();
});

test('Can create client', t => {
    const client = getClient();
    t.truthy(client);
});

test('Upload fails when file stream not provided', async t => {
    t.plan(1);

    const client = getClient();
    try {
        await client.uploadExisting();
    } catch(err) {
        t.is(err.message, 'Read stream missing');
    }
});

test('Upload only returns response body on success', async t => {
    const client = getClient();
    const body = { foo: 'bar' };

    t.context.sandbox.stub(got, 'put', () => {
        return Promise.resolve({ body });
    });
    stubTokenRequest(t);

    const res = await client.uploadExisting({});
    t.deepEqual(res, body);
});
