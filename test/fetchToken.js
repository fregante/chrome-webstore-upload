import test from 'ava';
import got from 'got';
import sinon from 'sinon';
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

test.serial('Only returns token from response body', async t => {
    t.plan(1);

    const { client, sandbox } = t.context;
    const accessToken = 'access-token';

    sandbox.stub(got, 'post', (uri) => {
        return Promise.resolve({
            body: {
                access_token: accessToken
            }
        });
    });

    t.is(await client.fetchToken(), accessToken);
});

t.todo('Request includes clientId, clientSecret, and refreshToken');
