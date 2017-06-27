# How to generate Google API keys

[chrome-webstore-upload](https://github.com/DrewML/chrome-webstore-upload) uses the Chrome Web Store API. 

Here's how to get its 3 access keys: `clientId`, `clientSecret`, `refreshToken`

*Note:* the names you enter here don't really matter.

0. Visit https://console.developers.google.com/apis/api/chromewebstore/overview
0. Create a project:

    <img width="296" alt="chrome-apis-create-project" src="https://cloud.githubusercontent.com/assets/1402241/21517725/55e5c626-cc96-11e6-9b55-ec9c80e10ec4.png">
0. Enter a name (e.g. `webstore-yourextensionname`)
0. Visit https://console.developers.google.com/apis/api/chromewebstore/overview again
0. Enable the API:

    <img width="400" alt="chrome-apis-enable-webstore" src="https://cloud.githubusercontent.com/assets/1402241/21517842/2a9f36a4-cc97-11e6-8ffa-ad49ac2ca3ce.png">

0. Open **Credentials** > **Create credentials** > **OAuth client ID**:

    <img width="400" alt="create-credentials" src="https://cloud.githubusercontent.com/assets/1402241/21517881/64f727f8-cc97-11e6-9c6b-b347b71352bf.png">

0. Click on **Configure consent screen**:

    > <img width="400" alt="configure consent screen" src="https://cloud.githubusercontent.com/assets/1402241/21517907/92640e0e-cc97-11e6-93f7-d077664eead9.png">

0. Enter a product name (e.g. `yourextensionname`) and save
0. Select **Other** and click **Create** 

    > <img width="187" alt="client type id" src="https://cloud.githubusercontent.com/assets/1402241/21517952/d1f36fce-cc97-11e6-92c0-de4485d97736.png">

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
