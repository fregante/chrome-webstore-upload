# How to generate Google API keys

[chrome-webstore-upload](https://github.com/DrewML/chrome-webstore-upload) uses the Chrome Web Store API. 

Here's how to get its 3 access keys: `clientId`, `clientSecret`, `refreshToken`

*Note:* the names you enter here don't really matter.

0. Visit https://console.developers.google.com/apis/credentials
0. Create a project:

	<img width="772" alt="Google APIs: Create project" src="https://user-images.githubusercontent.com/1402241/77865620-9a8a3680-722f-11ea-99cb-b09e5c0c11ec.png">

0. Enter `chrome-webstore-upload` and **Create**
0. Click on **Configure consent screen**
0. Only enter the Application name (e.g. `chrome-webstore-upload`) and **Save**

	<img width="475" alt="Consent screen configuration" src="https://user-images.githubusercontent.com/1402241/77865809-82ff7d80-7230-11ea-8a96-e381d55524c5.png">

0. Visit https://console.developers.google.com/apis/credentials again
0. Click **Create credentials** > **OAuth client ID**:

	<img width="771" alt="Create credentials" src="https://user-images.githubusercontent.com/1402241/77865679-e89f3a00-722f-11ea-942d-5245091f22b8.png">

0. Select **Other** 

    > <img width="187" alt="Configure client type" src="https://cloud.githubusercontent.com/assets/1402241/21517952/d1f36fce-cc97-11e6-92c0-de4485d97736.png">

0. Enter a product name (e.g. `chrome-webstore-upload`) and click **Create** 

0. Save your ✅ `clientId` and ✅ `clientSecret`, these are your keys.
0. Place your `clientId` in this URL and open it:

        https://accounts.google.com/o/oauth2/auth?client_id=YOUR_CLIENT_ID&response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&redirect_uri=urn:ietf:wg:oauth:2.0:oob

0. Follow its steps and copy the `authcode` it shows on the last page:

    > <img width="400" alt="auth code" src="https://cloud.githubusercontent.com/assets/1402241/21518094/c3033bb0-cc98-11e6-82bb-f6c69ca103fe.png">

0. Run this in your browser console.  
It's a wizard to create and copy a `curl` into your clipboard:

        copy(`curl "https://accounts.google.com/o/oauth2/token" -d "client_id=${encodeURIComponent(prompt('Enter your clientId'))}&client_secret=${encodeURIComponent(prompt('Enter your clientSecret'))}&code=${encodeURIComponent(prompt('Enter your authcode'))}&grant_type=authorization_code&redirect_uri=urn:ietf:wg:oauth:2.0:oob"`);alert('The curl has been copied. Paste it into your terminal.')


0. Paste the generated code in your terminal and run it.
0. Save your ✅ `refreshToken`:

    <img width="400" alt="access token" src="https://cloud.githubusercontent.com/assets/1402241/21518331/9b7e3b42-cc9a-11e6-8d65-cde5ba5ea105.png">

0. Done. Now you should have ✅ `clientId`, ✅ `clientSecret` and ✅ `refreshToken`. You can use these for all your extensions, but don't share them!
