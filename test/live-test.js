import fs from 'node:fs';
import process from 'node:process';
import chromeWebstoreUpload from '../index.js';

const myZipFile = fs.createReadStream('./web-ext-artifacts/live-test.zip');

const store = chromeWebstoreUpload({
    extensionId: 'nphhdjlnhlicpjcpanamejkfehegdclg',
    clientId: process.env.CID,
    clientSecret: process.env.CS,
    refreshToken: process.env.RT,
});

const token = await store.fetchToken();
console.log({ token });
const upload = await store.uploadExisting(myZipFile, token);
console.log({ upload });
const publish = await store.publish('trustedTesters', token);
console.log({ publish });
