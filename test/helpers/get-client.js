const webStoreUpload = require('../../index.js');

module.exports = function getClient() {
    return webStoreUpload({
        extensionId: 'foo',
        clientId: 'bar',
        refreshToken: 'heyhey',
    });
};
