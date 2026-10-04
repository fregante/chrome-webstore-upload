# chrome-webstore-upload

> Upload and publish extensions to the [Chrome Web Store](https://chromewebstore.google.com/category/extensions) from Node.js, using the [Chrome Web Store API v2](https://developer.chrome.com/docs/webstore/api).

[![npm version](https://img.shields.io/npm/v/chrome-webstore-upload)](https://www.npmjs.com/package/chrome-webstore-upload)
[![npm downloads](https://img.shields.io/npm/dm/chrome-webstore-upload)](https://www.npmjs.com/package/chrome-webstore-upload)

Looking for a command line tool? Use [chrome-webstore-upload-cli](https://github.com/fregante/chrome-webstore-upload-cli).

Need Google API keys? Follow [the guide](https://github.com/fregante/chrome-webstore-upload-keys).

## Install

```sh
npm install --save-dev chrome-webstore-upload
```

## Requirements

- 

## Setup

You will need a Chrome Web Store developer account with an existing extension (the first version must be [created manually](https://developer.chrome.com/docs/webstore/publish) in the dashboard) and these values:

| Value          | Where to get it                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `extensionId`  | The 32-character ID of your extension (visible in its Chrome Web Store URL and in the Developer Dashboard)                   |
| `publisherId`  | Your developer account identifier, **not** the extension ID. Found in the Developer Dashboard URL and on its Settings page   |
| `clientId`     | Google OAuth credentials, see [the guide](https://github.com/fregante/chrome-webstore-upload-keys)                           |
| `clientSecret` | Same as above. Optional if the token was created for a "Chrome App" OAuth client                                             |
| `refreshToken` | Same as above                                                                                                                |

Never commit these values. Load them from environment variables or your CI secret store.

## Quick start

```ts
import chromeWebstoreUpload from 'chrome-webstore-upload';

const store = chromeWebstoreUpload({
	extensionId: process.env.EXTENSION_ID!,
	publisherId: process.env.PUBLISHER_ID!,
	clientId: process.env.CLIENT_ID!,
	clientSecret: process.env.CLIENT_SECRET!,
	refreshToken: process.env.REFRESH_TOKEN!,
});

const token = await store.fetchToken();

await store.uploadExisting('./dist', token);
await store.publish('DEFAULT_PUBLISH', token);
```

All methods return a promise.

## API

### `chromeWebstoreUpload(options)`

Creates a client bound to a single extension.

```ts
const store = chromeWebstoreUpload({
	extensionId: 'ecnglinljpjkbgmdpeiglonddahpbkeb',
	publisherId: 'your-publisher-id',
	clientId: 'xxxxxxxxxx',
	clientSecret: 'xxxxxxxxxx',
	refreshToken: 'xxxxxxxxxx',
});
```

| Option         | Type     | Required | Description                                    |
| -------------- | -------- | -------- | ---------------------------------------------- |
| `extensionId`  | `string` | yes      | ID of the extension to manage                  |
| `publisherId`  | `string` | yes      | Your Chrome Web Store publisher ID             |
| `clientId`     | `string` | yes      | Google OAuth client ID                         |
| `clientSecret` | `string` | no\*     | Google OAuth client secret                     |
| `refreshToken` | `string` | yes      | OAuth refresh token                            |

\* Not needed for tokens generated for a "Chrome App" OAuth client.

### `store.uploadExisting(source, token?, maxAwaitInProgressSeconds?)`

Uploads a new version of an existing extension.

| Parameter                   | Type                     | Description                                                                                                      |
| --------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `source`                    | `ReadStream` \| `string` | A zip stream, or a path to a `.zip`, `.crx` or directory. Directories are zipped automatically and must contain a `manifest.json`. `.crx` is only supported as a path, not as a stream |
| `token`                     | `string`                 | Optional access token. One is fetched if omitted                                                                 |
| `maxAwaitInProgressSeconds` | `number`                 | Optional. If the API responds with `IN_PROGRESS`, wait up to this many seconds for the upload to finish         |

Returns the [upload response](https://developer.chrome.com/docs/webstore/api/reference/rest/v2/publishers.items/upload).

```ts
import {createReadStream} from 'node:fs';

// Zip stream
await store.uploadExisting(createReadStream('./mypackage.zip'));

// Zip or crx path
await store.uploadExisting('./path/to/extension.zip');
await store.uploadExisting('./path/to/extension.crx');

// Directory (zipped for you)
await store.uploadExisting('./path/to/extension-directory');

// Wait up to 60 seconds for processing to complete
await store.uploadExisting('./dist', undefined, 60);
```

### `store.publish(publishType?, token?, deployPercentage?)`

Submits the uploaded version for review and publishing.

| Parameter          | Type                                   | Default             | Description                                       |
| ------------------ | -------------------------------------- | ------------------- | ------------------------------------------------- |
| `publishType`      | `'DEFAULT_PUBLISH'` \| `'STAGED_PUBLISH'` | `'DEFAULT_PUBLISH'` | When the item is published                        |
| `token`            | `string`                               | fetched on demand   | Access token                                      |
| `deployPercentage` | `number`                               | —                   | Initial rollout percentage                        |

Returns the [publish response](https://developer.chrome.com/docs/webstore/api/reference/rest/v2/publishers.items/publish).

```ts
await store.publish('DEFAULT_PUBLISH');
await store.publish('STAGED_PUBLISH', undefined, 10);
```

### `store.setDeployPercentage(percentage, token?)`

Updates the rollout percentage of an already published extension, without triggering a new review. The value must be higher than the current one.

```ts
await store.setDeployPercentage(50);
```

See the [API reference](https://developer.chrome.com/docs/webstore/api/reference/rest/v2/publishers.items/setPublishedDeployPercentage).

### `store.get(token?)`

Fetches the current [item status](https://developer.chrome.com/docs/webstore/api/reference/rest/v2/publishers.items/fetchStatus).

```ts
const status = await store.get();
console.log(status);
```

### `store.fetchToken()`

Exchanges the refresh token for an access token.

```ts
const token = await store.fetchToken();
```

Fetch it once and pass it to every other method to avoid redundant token requests.

## Recipes

### Upload and publish

```ts
const token = await store.fetchToken();

const upload = await store.uploadExisting('./dist', token, 120);
console.log(upload);

const publish = await store.publish('DEFAULT_PUBLISH', token);
console.log(publish);
```

### Staged rollout

```ts
const token = await store.fetchToken();

await store.uploadExisting('./dist', token, 120);
await store.publish('STAGED_PUBLISH', token, 5);

// Later, once you're confident in the release
for (const percentage of [25, 50, 100]) {
	await store.setDeployPercentage(percentage, token);
}
```

## Error handling

Methods reject when the API returns an error or when the upload fails.

```ts
try {
	await store.uploadExisting('./dist', undefined, 120);
	await store.publish();
} catch (error) {
	console.error('Release failed:', error);
	process.exitCode = 1;
}
```

## Related

- [chrome-webstore-upload-cli](https://github.com/fregante/chrome-webstore-upload-cli) - Command line interface for this module
- [chrome-webstore-upload-keys](https://github.com/fregante/chrome-webstore-upload-keys) - Generate the Google API keys
- [webext-storage-cache](https://github.com/fregante/webext-storage-cache) - Map-like promised cache storage with expiration
- [webext-dynamic-content-scripts](https://github.com/fregante/webext-dynamic-content-scripts) - Automatically registers your `content_scripts` on domains added via `permission.request`
- [Awesome-WebExtensions](https://github.com/fregante/Awesome-WebExtensions) - A curated list of awesome resources for WebExtensions development
- [More…](https://github.com/fregante/webext-fun)

## License

MIT
