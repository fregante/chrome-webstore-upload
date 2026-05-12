import webStoreUpload from '../../source/index.js';

export default function getClient() {
    return webStoreUpload({
        extensionId: 'foo',
        publisherId: 'test-publisher',
        clientId: 'bar',
        refreshToken: 'heyhey',
    });
}
