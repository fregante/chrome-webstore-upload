# chrome-webstore-upload

> A small node.js module to upload/publish extensions to the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions).

If you're looking to upload/publish from the CLI, then use [chrome-webstore-upload-cli](https://github.com/fregante/chrome-webstore-upload-cli).

## Install

```
npm install --save-dev chrome-webstore-upload
```

## Setup

You will need a Google API `clientId`, `clientSecret` and `refreshToken`. Use [the guide]( https://github.com/fregante/chrome-webstore-upload-keys).

## Usage

All methods return a  promise.

### Create a new client

```javascript
import chromeWebstoreUpload from 'chrome-webstore-upload';

const store = chromeWebstoreUpload({
  extensionId: 'ecnglinljpjkbgmdpeiglonddahpbkeb',
  clientId: 'xxxxxxxxxx',
  clientSecret: 'xxxxxxxxxx',
  refreshToken: 'xxxxxxxxxx',
});
```

### Upload to existing extension

```javascript
import fs from 'fs';

const myZipFile = fs.createReadStream('./mypackage.zip');
const token = 'xxxx'; // optional. One will be fetched if not provided
const response = await store.uploadExisting(myZipFile, token);
// response is a Resource Representation
// https://developer.chrome.com/webstore/webstore_api/items#resource
```

### Publish extension

```javascript
const target = 'default'; // optional. Can also be 'trustedTesters'
const token = 'xxxx'; // optional. One will be fetched if not provided
const deployPercentage = 25; // optional. Will default to 100%.
const response = await store.publish(target, token, deployPercentage);
// response is documented here:
// https://developer.chrome.com/webstore/webstore_api/items#publish
```

### Get a Chrome Web Store item

```javascript
const projection = "DRAFT"; // optional. Can also be 'PUBLISHED' but only "DRAFT" is supported at this time.
const token = "xxxx"; // optional. One will be fetched if not provided
const response = await store.get(projection, token);
// response is documented here:
// https://developer.chrome.com/docs/webstore/webstore_api/items#get
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
