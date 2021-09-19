import webStoreUpload from '../../index.js';

export default function getClient() {
    return webStoreUpload({
        extensionId: 'foo',
        clientId: 'bar',
        refreshToken: 'heyhey',
    });
}
