# chrome-webstore-upload

> A small node.js module to upload/publish extensions to the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions).

If you're looking to upload/publish from the CLI, then use [chrome-webstore-upload-cli](https://github.com/fregante/chrome-webstore-upload-cli).

## Install

```
npm install --save-dev chrome-webstore-upload
```

## Setup

You will need a Google API `clientId`, `clientSecret` and `refreshToken`. Use [the guide]( https://github.com/fregante/chrome-webstore-upload-keys).

You also need your Chrome Web Store `publisherId` (your developer account identifier, not the extension ID). You can find it in the Chrome Web Store Developer Dashboard URL when logged in.

## Usage

All methods return a  promise.

### Create a new client

```javascript
import chromeWebstoreUpload from 'chrome-webstore-upload';

const store = chromeWebstoreUpload({
  extensionId: 'ecnglinljpjkbgmdpeiglonddahpbkeb',
  publisherId: 'your-publisher-id',
  clientId: 'xxxxxxxxxx',
  clientSecret: 'xxxxxxxxxx',
  refreshToken: 'xxxxxxxxxx',
});
```

### Upload to existing extension

You can upload a zip file, crx file, or a directory. If you provide a directory, it will be automatically zipped. Crx files are only supported as path, not as stream.

```javascript
import fs from 'fs';

// Upload a zip file
const myZipFile = fs.createReadStream('./mypackage.zip');
const token = 'xxxx'; // optional. One will be fetched if not provided
const maxAwaitInProgressResponseSeconds = 60; // optional. If the API response is IN_PROGRESS, this method will wait until it becomes successful, or until the specified timeout
const response = await store.uploadExisting(myZipFile, token, maxAwaitInProgressResponseSeconds);
// response is a Resource Representation
// https://developer.chrome.com/docs/webstore/api/reference/rest/v2/publishers.items/upload
```

```javascript
// Upload a directory (it will be zipped automatically)
const response = await store.uploadExisting('./path/to/extension-directory', token, maxAwaitInProgressResponseSeconds);
// The directory must contain a manifest.json file
```

```javascript
// Upload a .zip or .crx file by path
const response = await store.uploadExisting('./path/to/extension.zip', token, maxAwaitInProgressResponseSeconds);
// or
const response = await store.uploadExisting('./path/to/extension.crx', token, maxAwaitInProgressResponseSeconds);
```

### Publish extension

```javascript
const publishType = 'DEFAULT_PUBLISH'; // optional. Can also be 'TRUSTED_TESTERS' or 'STAGED_PUBLISH'
const token = 'xxxx'; // optional. One will be fetched if not provided
const deployPercentage = 25; // optional. Sets the initial rollout percentage.
const response = await store.publish(publishType, token, deployPercentage);
// response is documented here:
// https://developer.chrome.com/docs/webstore/api/reference/rest/v2/publishers.items/publish
```

### Set deployment rollout percentage

Update the deployment percentage for an already-published extension without triggering a re-review:

```javascript
const deployPercentage = 50; // required. Must be higher than the current value.
const token = 'xxxx'; // optional. One will be fetched if not provided
await store.setDeployPercentage(deployPercentage, token);
// https://developer.chrome.com/docs/webstore/api/reference/rest/v2/publishers.items/setPublishedDeployPercentage
```

### Get Chrome Web Store item status

```javascript
const token = "xxxx"; // optional. One will be fetched if not provided
const response = await store.get(token);
// response is documented here:
// https://developer.chrome.com/docs/webstore/api/reference/rest/v2/publishers.items/fetchStatus
```

### Fetch token

```javascript
const token = store.fetchToken();
// token is  astring
```

## Tips

- If you plan to upload _and_ publish at the same time, use the `fetchToken` method, and pass it to both `uploadExisting` and `publish` as the optional second parameter. This will avoid those methods making duplicate calls for new tokens.

## Related

- [webext-storage-cache](https://github.com/fregante/webext-storage-cache) - Map-like promised cache storage with expiration. Chrome and Firefox
- [webext-dynamic-content-scripts](https://github.com/fregante/webext-dynamic-content-scripts) - Automatically registers your content_scripts on domains added via permission.request
- [Awesome-WebExtensions](https://github.com/fregante/Awesome-WebExtensions) - A curated list of awesome resources for WebExtensions development.
- [More…](https://github.com/fregante/webext-fun)
