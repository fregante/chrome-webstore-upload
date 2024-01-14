import webStoreUpload from '../../source/index.ts';

export default function getClient() {
    return webStoreUpload({
        extensionId: 'foo',
        clientId: 'bar',
        refreshToken: 'heyhey',
    });
}
