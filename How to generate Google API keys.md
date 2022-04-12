# How to generate Google API keys

[chrome-webstore-upload](https://github.com/fregante/chrome-webstore-upload) uses the Chrome Web Store API.

## Change notes:

Version below v0.5.0 used `clientSecret`, but this is no longer used, as long as you create a "Desktop App" OAuth.

[Issue #59](https://github.com/fregante/chrome-webstore-upload/issues/59): Due to [Google deprecating the oob flow](https://developers.googleblog.com/2022/02/making-oauth-flows-safer.html), the process of generating a refresh token was revised. To generate a refresh token, this tool will be used: [gcp-refresh-token](https://www.npmjs.com/package/gcp-refresh-token).

_Note:_ the names you enter here don't really matter. It's an app that only you will have access to. This will take approximately 10 minutes and Google likes to change these screens often. Sorry.

## Process

Here's how to get its 2 access keys: `clientId`, `refreshToken`

0. Visit https://console.developers.google.com/apis/credentials
0. Create a project:

	> <img width="772" alt="Google APIs: Create project" src="https://user-images.githubusercontent.com/1402241/77865620-9a8a3680-722f-11ea-99cb-b09e5c0c11ec.png">

0. Enter `chrome-webstore-upload` and **Create**
0. Visit https://console.cloud.google.com/apis/credentials/consent
0. Select on **External** and **Create**

	> <img width="804" alt="OAuth Consent Screen" src="https://user-images.githubusercontent.com/1402241/133878019-f159f035-2b76-4686-a461-0e0005355da6.png">

0. Only enter the Application name (e.g. `chrome-webstore-upload`) and required email fields, and click **Save**

	> <img width="475" alt="Consent screen configuration" src="https://user-images.githubusercontent.com/1402241/77865809-82ff7d80-7230-11ea-8a96-e381d55524c5.png">

0. On the 3rd screen, add your own email address:

	> <img width="632" alt="Test users selection" src="https://user-images.githubusercontent.com/1402241/106213510-7c180300-6192-11eb-97b4-b4ae92424bf1.png">

0. Visit https://console.developers.google.com/apis/library/chromewebstore.googleapis.com
0. Click **Enable**
0. Visit https://console.developers.google.com/apis/credentials
0. Click **Create credentials** > **OAuth client ID**:

	> <img width="771" alt="Create credentials" src="https://user-images.githubusercontent.com/1402241/77865679-e89f3a00-722f-11ea-942d-5245091f22b8.png">

0. Select **Desktop app**, enter `Chrome Webstore Upload`, and click **Create**

	> <img width="547" alt="Create OAuth client ID" src="https://user-images.githubusercontent.com/6723574/163024843-4856a90b-4f3d-41b1-877f-0d66a0e8dbba.png">

0. Download the OAuth client JSON key, save it into a `key.json` file:

	> <img width="567" alt="OAuth client created" src="https://user-images.githubusercontent.com/6723574/163025132-752a8ce7-388f-4b9c-aede-47e0c99a4847.png">

0. Visit https://console.cloud.google.com/apis/credentials/consent
0. Click **PUBLISH APP** and confirm

	<img width="771" alt="Publish app" src="https://user-images.githubusercontent.com/27696701/114265946-2da2a280-9a26-11eb-9567-c4e00f572500.png">

0. Open a console/terminal where you stored your `key.json` file. Run the following, replacing `npx` with `pnpm dlx` or `yarn dlx` as needed:

	> npx gcp-refresh-token

0. The command will open an OAuth consent screen on the web. Follow its steps and warnings (this is your own personal app). Make sure the local `port` is correct.

9001. Done. Now you should have ✅ `clientId` and ✅ `refreshToken` in `key.json`. You can use these for all your extensions, but don't share them!
