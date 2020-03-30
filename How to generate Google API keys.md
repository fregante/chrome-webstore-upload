# How to generate Google API keys

[chrome-webstore-upload](https://github.com/DrewML/chrome-webstore-upload) uses the Chrome Web Store API. 

Here's how to get its 3 access keys: `clientId`, `clientSecret`, `refreshToken`

*Note:* the names you enter here don't really matter. This will take approximately 10 minutes, sorry.

1. Visit https://console.developers.google.com/apis/credentials
0. Create a project:

	<img width="772" alt="Google APIs: Create project" src="https://user-images.githubusercontent.com/1402241/77865620-9a8a3680-722f-11ea-99cb-b09e5c0c11ec.png">

0. Enter `chrome-webstore-upload` and **Create**
0. Click on **Configure consent screen**
0. Select on **External** and **Create**
0. Only enter the Application name (e.g. `chrome-webstore-upload`) and **Save**

	<img width="475" alt="Consent screen configuration" src="https://user-images.githubusercontent.com/1402241/77865809-82ff7d80-7230-11ea-8a96-e381d55524c5.png">

0. Visit https://console.developers.google.com/apis/library/chromewebstore.googleapis.com
0. Click **Enable**
0. Visit https://console.developers.google.com/apis/credentials
0. Click **Create credentials** > **OAuth client ID**:

	<img width="771" alt="Create credentials" src="https://user-images.githubusercontent.com/1402241/77865679-e89f3a00-722f-11ea-942d-5245091f22b8.png">

0. Select **Other**, enter `chrome-webstore-upload` and click **Create** 

    > <img width="187" alt="Configure client type" src="https://cloud.githubusercontent.com/assets/1402241/21517952/d1f36fce-cc97-11e6-92c0-de4485d97736.png">

0. Save your ✅ `clientId` and ✅ `clientSecret`, these are your 2 of your 3 keys.
0. Place your `clientId` in this URL and open it:

        https://accounts.google.com/o/oauth2/auth?client_id=YOUR_CLIENT_ID&response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&redirect_uri=urn:ietf:wg:oauth:2.0:oob

0. Follow its steps and warnings (this is your own peronal app) and wait on the last page:

    > <img width="1021" alt="Last page of OAuth" src="https://user-images.githubusercontent.com/1402241/77866731-79781480-7234-11ea-8f81-c533846d89ea.png">

0. Run this in your browser console **on that last page**. It's a wizard to create your `refresh_token`:

```js
response = await fetch('https://accounts.google.com/o/oauth2/token', {
  method: "POST",
  body: new URLSearchParams([
    ['client_id', prompt('Enter your clientId')],
    ['client_secret', prompt('Enter your clientSecret')],
    ['code', new URLSearchParams(location.search).get('approvalCode')],
    ['grant_type', 'authorization_code'],
    ['redirect_uri', 'urn:ietf:wg:oauth:2.0:oob']
  ]),
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
});
json = await response.json();
console.log(json);
if (!json.error) {
  copy(json.refresh_token);
  alert('The refresh_token has been copied into your clipboard. You’re done!');
}
```

9001. Done. Now you should have ✅ `clientId`, ✅ `clientSecret` and ✅ `refreshToken`. You can use these for all your extensions, but don't share them!
