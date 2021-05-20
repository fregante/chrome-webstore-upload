# How to generate Google API keys

[chrome-webstore-upload](https://github.com/DrewML/chrome-webstore-upload) uses the Chrome Web Store API. 

Here's how to get its 2 access keys: `clientId`, `refreshToken`

Version below v2 used `clientSecret`, but this is no longer used, as long as you create a "Chrome App" OAuth.

*Note:* the names you enter here don't really matter. This will take approximately 10 minutes and Google likes to change these screens often. Sorry.

1. Visit https://console.developers.google.com/apis/credentials
0. Create a project:

	<img width="772" alt="Google APIs: Create project" src="https://user-images.githubusercontent.com/1402241/77865620-9a8a3680-722f-11ea-99cb-b09e5c0c11ec.png">

0. Enter `chrome-webstore-upload` and **Create**
0. Click on **Configure consent screen**
0. Select on **External** and **Create**
0. Only enter the Application name (e.g. `chrome-webstore-upload`) and required email fields, and click **Save**

	> <img width="475" alt="Consent screen configuration" src="https://user-images.githubusercontent.com/1402241/77865809-82ff7d80-7230-11ea-8a96-e381d55524c5.png">

0. On the 3rd screen, add your own email address:

	> <img width="632" alt="Test users selection" src="https://user-images.githubusercontent.com/1402241/106213510-7c180300-6192-11eb-97b4-b4ae92424bf1.png">

0. Visit https://console.developers.google.com/apis/library/chromewebstore.googleapis.com
0. Click **Enable**
0. Visit https://console.developers.google.com/apis/credentials
0. Click **Create credentials** > **OAuth client ID**:

	> <img width="771" alt="Create credentials" src="https://user-images.githubusercontent.com/1402241/77865679-e89f3a00-722f-11ea-942d-5245091f22b8.png">

0. Select **Chrome app**, enter `Chrome Webstore Upload`, your extension’s ID, and click **Create** 

	> <img width="547" alt="Create OAuth client ID" src="https://user-images.githubusercontent.com/1402241/106205904-de6a0700-6184-11eb-8591-984e69c5e82a.png">


0. Save your ✅ `clientId` and ignore the `clientSecret`; `clientId` is 1 of the 2 keys you will need
0. Visit https://console.cloud.google.com/apis/credentials/consent
0. Click **PUBLISH APP** and confirm

	<img width="771" alt="Publish app" src="https://user-images.githubusercontent.com/27696701/114265946-2da2a280-9a26-11eb-9567-c4e00f572500.png">


0. Place your `clientId` in this URL and open it:

	`https://accounts.google.com/o/oauth2/auth?client_id=YOUR_CLIENT_ID&response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&redirect_uri=urn:ietf:wg:oauth:2.0:oob&access_type=offline&approval_prompt=force`

0. Follow its steps and warnings (this is your own personal app)
0. Wait on this page:

	<img width="521" alt="Last page of OAuth" src="https://user-images.githubusercontent.com/1402241/77866731-79781480-7234-11ea-8f81-c533846d89ea.png">

0. Run this in your browser console **on that last page**. It's a wizard to create your `refresh_token`:

```js
(async () => {
  const response = await fetch('https://accounts.google.com/o/oauth2/token', {
    method: "POST",
    body: new URLSearchParams([
      ['client_id', prompt('Enter your clientId')],
      ['code', new URLSearchParams(location.search).get('approvalCode')],
      ['grant_type', 'authorization_code'],
      ['redirect_uri', 'urn:ietf:wg:oauth:2.0:oob']
    ]),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  const json = await response.json();
  console.log(json);
  if (!json.error) {
    if (typeof copy === 'function') {
      copy(json.refresh_token);
      alert('The refresh_token has been copied into your clipboard. You’re done!');
    } else {
      console.log('Copy your token:', json.refresh_token);
      alert('Copy your refresh_token from the console output. You’re done!');
    }
  }
})();
```

9001. Done. Now you should have ✅ `clientId` and ✅ `refreshToken`. You can use these for all your extensions, but don't share them!
