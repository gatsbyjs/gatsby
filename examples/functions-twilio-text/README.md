<p align="center">
  <a href="https://www.gatsbyjs.com/?utm_source=starter&utm_medium=readme&utm_campaign=gatsby-functions-beta">
    <img alt="Gatsby" src="https://www.gatsbyjs.com/Gatsby-Monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Gatsby Functions Twilio Example
</h1>

## 🚀 Quick start

1.  **Get Twilio Credentials.**

    Create an account on [Twilio](https://www.twilio.com/). We'll use WhatsApp for this demo as Twilio has a free test sandbox for WhatsApp (where with SMS you must first purchase a phone number). Head to the [WhatsApp getting started page](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn?frameUrl=%2Fconsole%2Fsms%2Fwhatsapp%2Flearn%3Fx-target-region%3Dus1) to enable your account to use the sandbox.

    There are **3** environment variable you'll need to add your project to properly run the starter:

    - `TWILIO_ACCOUNT_SID`: Get your Twilio Account SID in the [Twilio Console Dashboard](https://www.twilio.com/console)
    - `TWILIO_AUTH_TOKEN`: Get your Twilio Auth Token in the [Twilio Console Dashboard](https://www.twilio.com/console)
    - `TWILIO_NUMBER`: Use the Twilio WhatsApp sandbox number `whatsapp:+14155238886`

    You'll want to add these as environment variables when deploying to Gatsby Cloud. Don't forget to add them to the Preview variables if you plan to add a CMS preview integration.

2.  **Start developing.**

    To get started, run `yarn` to add all necessary packages.

    When developing locally, you'll want to include the ENV variables in your `.env.development`. Read more about how Gatsby handles `.env` files and environment variables in the [Gatbsy Docs](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/)

    ```shell
    cd twilio-text
    yarn
    yarn run develop
    ```

3.  **Open the code and start customizing!**

    Your site is now running at http://localhost:8000! You can use the UI on the index page to test the functions or directly access them at http://localhost:8000/api/twilio

    When sending messages to WhatsApp numbers, the format you use is `whatsapp:` + the number e.g. `whatsapp:+14004004000`

    Edit `src/pages/index.js` to see your site update in real-time!

4.  **Deploy**

You can deploy this example on Gatsby Cloud by copying the example into a new repo and [connecting that to Gatsby Cloud](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/deploying-to-gatsby-cloud/#set-up-an-existing-gatsby-site).

<!--- Working on improving deploy now to use subdirectories
4.  **Deploy**

    You can directly deploy this starter by using the Deploy button below and select the directory for the Twilio example. Otherwise, fork this repo and create your own repo and [connect that to Gatsby Cloud](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/deploying-to-gatsby-cloud/#set-up-an-existing-gatsby-site).

    [<img src="https://www.gatsbyjs.com/deploynow.svg">](https://www.gatsbyjs.com/dashboard/deploynow?url=https://github.com/gatsbyjs/gatsby-functions-beta/)



    [<img src="https://www.gatsbyjs.com/deploynow.svg">](https://www.gatsbyjs.com/dashboard/deploynow?url=https://github.com/gatsbyjs/gatsby-functions-beta/tree/main/examples/twilio-text)

    -->
