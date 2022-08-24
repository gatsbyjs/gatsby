<p align="center">
  <a href="https://www.gatsbyjs.com/?utm_source=starter&utm_medium=readme&utm_campaign=gatsby-functions-beta">
    <img alt="Gatsby" src="https://www.gatsbyjs.com/Gatsby-Monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Gatsby Functions Google Gmail Examples
</h1>

## 🚀 Quick start

1.  **Set up Google OAuth Client.**

    This sample uses google oAuth client to authenticate into the Google inbox api. Obtain an oAuth credential from the Google Cloud [API & Services Credentials Page](https://console.cloud.google.com/apis/credentials?)

    - Generate an Oauth Client ID. You can follow the steps highlighted in [Account Authentication - Service Account](https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication?id=oauth). Make sure to set up at least one **Authorized redirect URI** to be `http://localhost:8000`
    - Enable the [Gmail API](https://console.cloud.google.com/apis/api/gmail.googleapis.com) in your Google Cloud project.

2.  **Add the Google Oauth Credentials to your `.env.development` file**

    There are **2** environment variable you'll need to add to your project:

    - `GATSBY_GOOGLE_CLIENT_ID`: Fetch the ClientId from the newly created OAuth 2.0 Client ID. You can find it in the [Google Credentials Console](https://console.cloud.google.com/apis/credentials)

    You'll also want to add these as environment variables when deploying to Gatsby Cloud.

3.  **Start developing.**

    To get started, run `npm install` to add all necessary packages.

    When developing locally, you include environment variables to your `.env.development`. Read more about how Gatsby handles `.env` files and environment variables in the [Gatsby Docs](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/)

    ```shell
    cd examples/functions-google-gmail
    npm install
    npm run develop
    ```

4.  **Open the code and start customizing!**

    Your site is now running at http://localhost:8000! You can use the UI on the index page to test the functions or directly access them at http://localhost:8000/api/{function_name}

    Edit `src/pages/index.js` to see your site update in real-time!

5.  **Deploy**

You can deploy this example on Gatsby Cloud by copying the example into a new repo and [connecting that to Gatsby Cloud](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/deploying-to-gatsby-cloud/#set-up-an-existing-gatsby-site).
