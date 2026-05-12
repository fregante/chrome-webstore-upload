import {
    test, expect, beforeEach, assert,
} from 'vitest';
import fetchMock from 'fetch-mock';
import { CWSError } from '../source/index.js';
import getClient from './helpers/get-client.js';

beforeEach(context => {
    fetchMock.reset();
    context.client = getClient();
});

test('Throws CWSError on invalid grant OAuth error', async ({ client }) => {
    const errorResponse = {
        error: 'invalid_grant',
        error_description: 'Bad Request',
    };

    fetchMock.post('https://www.googleapis.com/oauth2/v4/token', {
        status: 400,
        body: errorResponse,
    });

    await expect(client.fetchToken()).rejects.toThrow(CWSError);
    await expect(client.fetchToken()).rejects.toThrow(/Invalid grant.*authentication keys are probably invalid or expired/);
});

test('Throws CWSError with cause on invalid grant error', async ({ client }) => {
    const errorResponse = {
        error: 'invalid_grant',
        error_description: 'Bad Request',
    };

    fetchMock.post('https://www.googleapis.com/oauth2/v4/token', {
        status: 400,
        body: errorResponse,
    });

    try {
        await client.fetchToken();
        assert.fail('Should have thrown an error');
    } catch (error) {
        expect(error).toBeInstanceOf(CWSError);
        expect(error.cause).toEqual(errorResponse.error);
    }
});

test('Throws CWSError on invalid request OAuth error', async ({ client }) => {
    const errorResponse = {
        error: 'invalid_request',
        error_description: 'client_secret is missing.',
    };

    fetchMock.post('https://www.googleapis.com/oauth2/v4/token', {
        status: 400,
        body: errorResponse,
    });

    await expect(client.fetchToken()).rejects.toThrow(CWSError);
    await expect(client.fetchToken()).rejects.toThrow(/Invalid request.*client_secret is missing/);
});

test('Throws CWSError on publish condition not met', async ({ client }) => {
    const errorResponse = {
        error: {
            code: 400,
            message: 'Publish condition not met: You may not edit or publish an item that is in review.',
            errors: [
                {
                    message: 'Publish condition not met: You may not edit or publish an item that is in review.',
                    domain: 'chromewebstore.access',
                    reason: 'badRequest',
                },
            ],
        },
    };

    fetchMock.postOnce('https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:publish', {
        status: 400,
        body: errorResponse,
    });

    try {
        await client.publish('DEFAULT_PUBLISH', 'token');
        assert.fail('Should have thrown an error');
    } catch (error) {
        expect(error).toBeInstanceOf(CWSError);
        expect(error.message).toMatch(/You may not edit or publish an item that is in review/);
    }
});

test('Throws CWSError with detailed privacy policy message', async ({ client }) => {
    const errorResponse = {
        error: {
            errors: [
                {
                    domain: 'global',
                    reason: 'badRequest',
                    message: 'Publish condition not met: To publish your item, you must provide mandatory privacy information in the new Developer Dashboard: https://chrome.google.com/webstore/devconsole. Click on your item from the home page and enter this information on the Privacy tab.',
                },
            ],
            code: 400,
            message: 'Publish condition not met: To publish your item, you must provide mandatory privacy information in the new Developer Dashboard: https://chrome.google.com/webstore/devconsole. Click on your item from the home page and enter this information on the Privacy tab.',
        },
    };

    fetchMock.postOnce('https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:publish', {
        status: 400,
        body: errorResponse,
    });

    try {
        await client.publish('DEFAULT_PUBLISH', 'token');
        assert.fail('Should have thrown an error');
    } catch (error) {
        expect(error).toBeInstanceOf(CWSError);
        expect(error.message).toContain('privacy information');
        expect(error.cause).toEqual(errorResponse.error);
    }
});

test('Throws CWSError on upload failure', async ({ client }) => {
    const errorResponse = {
        error: {
            code: 400,
            message: 'Invalid package: Manifest file is missing or unreadable.',
        },
    };

    fetchMock.postOnce('https://chromewebstore.googleapis.com/upload/v2/publishers/test-publisher/items/foo:upload', {
        status: 400,
        body: errorResponse,
    });

    try {
        await client.uploadExisting({}, 'token');
        assert.fail('Should have thrown an error');
    } catch (error) {
        expect(error).toBeInstanceOf(CWSError);
        expect(error.message).toContain('Invalid package');
    }
});

test('Throws CWSError on multiple contact email and certification errors', async ({ client }) => {
    const errorResponse = {
        error: {
            code: 400,
            message: 'Publish condition not met: You must provide a contact email before you can publish any item. Enter your contact email on the Account tab.; To publish your item, you must certify that your data usage complies with our Developer Program Policies. You can certify this on the Privacy practices tab of the item edit page.',
            errors: [
                {
                    message: 'Publish condition not met: You must provide a contact email before you can publish any item. Enter your contact email on the Account tab.; To publish your item, you must certify that your data usage complies with our Developer Program Policies. You can certify this on the Privacy practices tab of the item edit page.',
                    domain: 'chromewebstore.access',
                    reason: 'badRequest',
                },
            ],
        },
    };

    fetchMock.postOnce('https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:publish', {
        status: 400,
        body: errorResponse,
    });

    try {
        await client.publish('DEFAULT_PUBLISH', 'token');
        assert.fail('Should have thrown an error');
    } catch (error) {
        expect(error).toBeInstanceOf(CWSError);
        expect(error.message).toContain('contact email');
        expect(error.message).toContain('certify');
        expect(error.cause).toEqual(errorResponse.error);
    }
});

test('Does not throw on successful upload', async ({ client }) => {
    const successResponse = {
        itemId: 'foo',
        uploadState: 'SUCCEEDED',
    };

    fetchMock.postOnce('https://chromewebstore.googleapis.com/upload/v2/publishers/test-publisher/items/foo:upload', {
        status: 200,
        body: successResponse,
    });

    const result = await client.uploadExisting({}, 'token');
    expect(result).toEqual(successResponse);
});

test('Does not throw on successful publish', async ({ client }) => {
    const successResponse = {
        itemId: 'foo',
        name: 'publishers/test-publisher/items/foo',
        state: 'PUBLISHED',
    };

    fetchMock.postOnce('https://chromewebstore.googleapis.com/v2/publishers/test-publisher/items/foo:publish', {
        status: 200,
        body: successResponse,
    });

    const result = await client.publish('DEFAULT_PUBLISH', 'token');
    expect(result).toEqual(successResponse);
});
