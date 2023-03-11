# How to generate Google API keys

[chrome-webstore-upload](https://github.com/fregante/chrome-webstore-upload) uses the Chrome Web Store API.

Here's how to get its 3 access keys: `clientId`, `clientSecret` and `refreshToken`

*Note:* the names you enter here don't really matter. It's an app that only you will have access to. This will take approximately 10 minutes and Google likes to change these screens often. Sorry.

0. Use Chrome or Firefox (The last step doesn't work in Safari)
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

0. Select **Desktop app**, enter `Chrome Webstore Upload` and click **Create**

	> <img width="568" alt="Create OAuth client ID" src="https://user-images.githubusercontent.com/1402241/163124196-c4bb4f26-9766-4766-bb81-3982875d3a84.png">

0. Save your ✅ `clientId` and ✅ `clientSecret`:

	> <img width="579" alt="OAuth client created" src="https://user-images.githubusercontent.com/1402241/163124986-151412fd-d15b-4dbd-8900-2ccfdc8cf32e.png">

0. Visit https://console.cloud.google.com/apis/credentials/consent
0. Click **PUBLISH APP** and confirm

	> <img width="771" alt="Publish app" src="https://user-images.githubusercontent.com/27696701/114265946-2da2a280-9a26-11eb-9567-c4e00f572500.png">

0. Place your `clientId` in this URL and open it:

	`https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fchromewebstore&redirect_uri=http%3A%2F%2Flocalhost%3A8818&access_type=offline&client_id=YOUR_CLIENT_ID_HERE`

0. Follow its steps and warnings (this is your own personal app)
0. You will reach this error page, with a URL that looks like:

	```
	http://localhost:8818/?code=4/0AX4XfWjwRDOZc_1nsxnupN8Xthe7dlfL0gB3pE-MMalTab0vWZBDj9ywDMacIT15U-Q&scope=https://www.googleapis.com/auth/chromewebstore
	```

	> <img width="478" alt="A page that says 'This site can’t be reached'" src="https://user-images.githubusercontent.com/1402241/163123857-d2741237-80ea-482e-b468-ef9df75330f8.png">

0. Copy the `approval code` between `code=` and `&scope`, it should look like this; use it in the next step:
	
	```
	4/0AX4XfWjwRDOZc_1nsxnupN8Xt-dont-use-this-code-IT15U-Q
	```

0. Run this in the browser console **on the same page** (otherwise you'll get CORS errors), it's a wizard to create your `refresh_token`:

```js
(async () => {
  const ask = message => decodeURIComponent(prompt(message).trim())
  const response = await fetch('https://accounts.google.com/o/oauth2/token', {
    method: "POST",
    body: new URLSearchParams([
      ['client_id', ask('Enter your clientId')],
      ['client_secret', ask('Enter your client secret')],
      ['code', ask('Enter your approval code')],
      ['grant_type', 'authorization_code'],
      ['redirect_uri', 'http://localhost:8818']
    ]),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  const json = await response.json();
  console.log(json);
  if (!json.error) {
    if (typeof copy === 'function' && !navigator.userAgent.includes('Firefox')) { // #58
      copy(json.refresh_token);
      alert('The refresh_token has been copied into your clipboard. You’re done!');
    } else {
      console.log('Copy your token:');
      console.log(json.refresh_token);
      alert('Copy your refresh_token from the console output. You’re done!');
    }
  }
})();
```

9001. Done. Now you should have ✅ `clientId`, ✅ `clientSecret` and ✅ `refreshToken`. You can use these for all your extensions, but don't share them!
