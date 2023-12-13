/** Use ../ to deploy this extension */
import chromeWebstoreUpload from '../index.js';
import login from '../.env.json' assert { type: 'json' };

const store = chromeWebstoreUpload(login);
