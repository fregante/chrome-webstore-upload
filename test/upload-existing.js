import test from 'ava';
import fetchMock from 'fetch-mock';
import getClient from './helpers/get-client.js';

function stubTokenRequest(t, token = 'token') {
    t.context.sandbox.stub(got, 'post').returns({
        json: t.context.sandbox.stub().resolves({
            access_token: token,
        }),
    });
}

test.beforeEach(t => {
    t.context = {
        client: getClient(),
    };
});

test('Upload fails when file stream not provided', async t => {
    const { client } = t.context;

    try {
        await client.uploadExisting();
        t.fail('Did not reject promise when file stream missing');
    } catch (error) {
        t.is(error.message, 'Read stream missing');
    }
});

test('Upload only returns response body on success', async t => {
    const { client } = t.context;
    const body = { foo: 'bar' };

    sandbox.stub(got, 'put').returns({
        json: sandbox.stub().resolves(body),
    });

    stubTokenRequest(t);

    const response = await client.uploadExisting({});
    t.deepEqual(response, body);
});

test('Upload does not fetch token when provided', async t => {
    const { client } = t.context;

    sandbox.stub(got, 'post').callsFake(() => {
        t.fail('Token should not have been fetched');
    });

    sandbox.stub(got, 'put').returns({
        json: sandbox.stub().resolves({}),
    });

    await client.uploadExisting({}, 'token');
    t.pass();
});

test('Upload uses token for auth', async t => {
    t.plan(1);

    const { client } = t.context;
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

test('Uses provided extension ID', async t => {
    t.plan(1);

    const { client } = t.context;
    const { extensionId } = client;

    sandbox.stub(got, 'put').callsFake(uri => {
        t.true(uri.includes(`/items/${extensionId}`));

        return {
            json: sandbox.stub().resolves({}),
        };
    });

    await client.uploadExisting({}, 'token');
});
