<p align="center">
  <a href="https://www.gatsbyjs.com/?utm_source=starter&utm_medium=readme&utm_campaign=gatsby-functions-beta">
    <img alt="Gatsby" src="https://www.gatsbyjs.com/Gatsby-Monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Gatsby Functions SendGrid Example
</h1>

## 🚀 Quick start

1.  **Get SendGrid Credentials.**

    Create an account on [SendGrid](https://sendgrid.com/) and verify a "single sender" email address that the function will use for sending emails.

    Add the following **2** environment variables to your a file named `.env.development`. You'll need these for the function to be able to send emails:

    - `SENDGRID_API_KEY`: An SendGrid API Key with full access. [SendGrid Docs](https://sendgrid.com/docs/ui/account-and-settings/api-keys/)
    - `SENDGRID_AUTHORIZED_EMAIL`: the "single sender" the email address you verified with SendGrid [SendGrid Docs](https://sendgrid.com/docs/glossary/sender-authentication/)

    Read more about how Gatsby handles `.env` files and environment variables in the [Gatbsy Docs](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/)

    You'll also want to add these as environment variables when deploying to Gatsby Cloud. Don't forget to add them to the Preview variables if you plan to add a CMS preview integration.

2.  **Start developing.**

    To get started, run `yarn` to install all necessary packages.

    ```shell
    cd sendgrid-email
    yarn
    yarn run develop
    ```

3.  **Open the code and start customizing!**

    Your site is now running at http://localhost:8000! You can use the UI on the index page to test the functions or directly access them at http://localhost:8000/api/sendgrid

    Edit `src/pages/index.js` to see your site update in real-time!

4.  **Deploy**

You can deploy this example on Gatsby Cloud by copying the example into a new repo and [connecting that to Gatsby Cloud](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/deploying-to-gatsby-cloud/#set-up-an-existing-gatsby-site).

<!--- Working on improving deploy now to use subdirectories
4.  **Deploy**
You can directly deploy this example by using the Deploy button below and select the directory for the SendGrid example. Otherwise, fork this repo and create your own repo and [connect that to Gatsby Cloud](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/deploying-to-gatsby-cloud/#set-up-an-existing-gatsby-site).

[<img src="https://www.gatsbyjs.com/deploynow.svg">](https://www.gatsbyjs.com/dashboard/deploynow?url=https://github.com/gatsbyjs/gatsby-functions-beta/)



[<img src="https://www.gatsbyjs.com/deploynow.svg">](https://www.gatsbyjs.com/dashboard/deploynow?url=https://github.com/gatsbyjs/gatsby-functions-beta/tree/main/examples/sendgrid-email)

-->
