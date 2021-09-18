const webStoreUpload = require('../..');

module.exports = function getClient() {
    return webStoreUpload({
        extensionId: 'foo',
        clientId: 'bar',
        refreshToken: 'heyhey'
    });
};
