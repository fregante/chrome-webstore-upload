# chrome-webstore-upload

> A small node.js module to upload/publish extensions to the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions).

If you're looking to upload/publish from the CLI, then use [chrome-webstore-upload-cli](https://github.com/fregante/chrome-webstore-upload-cli).

## Install
```
npm install --save-dev chrome-webstore-upload
```

## Setup

You will need a Google API `clientId` and a `refreshToken`. Read [the guide](./How%20to%20generate%20Google%20API%20keys.md).

Note: If you created the APIs before version 0.5.0 (September 2021), you might have to follow [the guide](./How%20to%20generate%20Google%20API%20keys.md) again. [Leave a comment](https://github.com/fregante/chrome-webstore-upload-cli/issues/44) if that happened to you.

## Usage

All methods return an ES2015-compliant promise.

### Create a new client
```javascript
const webStore = require('chrome-webstore-upload')({
    extensionId: 'ecnglinljpjkbgmdpeiglonddahpbkeb',
    clientId: 'xxxxxxxxxx',
    refreshToken: 'xxxxxxxxxx'
});
```

### Upload to existing extension
```javascript
const fs = require('fs');

const myZipFile = fs.createReadStream('./mypackage.zip');
const token = 'xxxx'; // optional. One will be fetched if not provided
webStore.uploadExisting(myZipFile, token).then(res => {
    // Response is a Resource Representation
    // https://developer.chrome.com/webstore/webstore_api/items#resource
});
```

### Publish extension
```javascript
const target = 'default'; // optional. Can also be 'trustedTesters'
const token = 'xxxx'; // optional. One will be fetched if not provided
webStore.publish(target, token).then(res => {
   // Response is documented here:
   // https://developer.chrome.com/webstore/webstore_api/items/publish
});
```

### Fetch token
```javascript
webStore.fetchToken().then(token => {
   // Token is a string
});
```

## Tips

- If you plan to upload _and_ publish at the same time, use the `fetchToken` method, and pass it to both `uploadExisting` and `publish` as the optional second parameter. This will avoid those methods making duplicate calls for new tokens.

## Prior Art
- [grunt-webstore-upload](https://github.com/c301/grunt-webstore-upload)
- [chrome-webstore-manager](https://github.com/pastak/chrome-webstore-manager)
