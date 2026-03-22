import fs from 'node:fs';
import process from 'node:process';
import chromeWebstoreUpload from 'chrome-webstore-upload';

const myZipFile = fs.createReadStream('./web-ext-artifacts/live-test.zip');

const store = chromeWebstoreUpload({
    extensionId: 'nphhdjlnhlicpjcpanamejkfehegdclg',
    publisherId: process.env.PID,
    clientId: process.env.CID,
    clientSecret: process.env.CS,
    refreshToken: process.env.RT,
});

const token = await store.fetchToken();
const upload = await store.uploadExisting(myZipFile, token);
console.log({ upload });
const publish = await store.publish('TRUSTED_TESTERS', token);
console.log({ publish });
