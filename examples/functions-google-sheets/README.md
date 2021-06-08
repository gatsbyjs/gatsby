<p align="center">
  <a href="https://www.gatsbyjs.com/?utm_source=starter&utm_medium=readme&utm_campaign=gatsby-functions-beta">
    <img alt="Gatsby" src="https://www.gatsbyjs.com/Gatsby-Monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Gatsby Functions Google Sheets Example
</h1>

## 🚀 Quick start

1.  **Get Google Authentication Token.**

    This sample uses the Google Service account to authenticate into Google Spreadsheet API. To receive the proper token information, you'll need to set up an account in the [Google API Console](https://console.cloud.google.com/apis/dashboard).

    - Set up your project in the Google API console. You can follow the instructions highlighted in Google Account Authentication tutorial [here](https://theoephraim.github.io/node-google-sreadsheet/#/getting-started/authentication)
    - Generate a service account and download the access token. You can follow the steps highlighted in [Account Authentication - Service Account](https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication?id=service-account)
    - Create an `.env.development` file. Copy into it from the downloaded JSON key file:

    ```
    GOOGLE_SERVICE_ACCOUNT_EMAIL=copy service account email
    GOOGLE_PRIVATE_KEY=copy private key
    ```

2.  **Create a Test Spreadsheet.**

    - Generate a new spreadsheet via [Google Sheets](https://docs.google.com/spreadsheets)
    - Grant owner access to the spreadsheet to your service account email address.
    - You will need the Sheet ID to propertly run the example. Sheet ID can be found in the URL of a Google spreadsheet. For example, you can find it via" `https://docs.google.com/spreadsheets/d/<GOOGLE_SHEET_ID>/`. Add this to your `.env.development` file as well.

3.  **Start developing.**

    To get started, run `yarn` to add all necessary packages.

    When developing locally, you'll want to include the ENV variables in your `.env.development`. Read more about how Gatsby handles `.env` files and environment variables in the [Gatbsy Docs](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/)

    ```shell
    cd google-sheets
    yarn
    yarn run develop
    ```

4.  **Open the code and start customizing!**

    Your site is now running at http://localhost:8000! You can use the UI on the index page to test the functions or directly access them at http://localhost:8000/api/sheets

    Edit `src/pages/index.js` to see your site update in real-time!

5.  **Deploy**

You can deploy this example on Gatsby Cloud by copying the example into a new repo and [connecting that to Gatsby Cloud](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/deploying-to-gatsby-cloud/#set-up-an-existing-gatsby-site).

<!--- Working on improving deploy now to use subdirectories

5.  **Deploy**
    You can directly deploy this example by using the Deploy button below and select the directory for the Google Sheets example. Otherwise, fork this repo and create your own repo and [connect that to Gatsby Cloud](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/deploying-to-gatsby-cloud/#set-up-an-existing-gatsby-site).

    [<img src="https://www.gatsbyjs.com/deploynow.svg">](https://www.gatsbyjs.com/dashboard/deploynow?url=https://github.com/gatsbyjs/gatsby-functions-beta/)



    [<img src="https://www.gatsbyjs.com/deploynow.svg">](https://www.gatsbyjs.com/dashboard/deploynow?url=https://github.com/gatsbyjs/gatsby-functions-beta/tree/main/examples/google-auth)

-->
