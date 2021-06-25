<p align="center">
  <a href="https://www.gatsbyjs.com/?utm_source=starter&utm_medium=readme&utm_campaign=gatsby-functions-beta">
    <img alt="Gatsby" src="https://www.gatsbyjs.com/Gatsby-Monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Gatsby Functions Airtable Form Example
</h1>

## 🚀 Quick start

1. Setup Airtable

   Create a new base named `Submissions` and create a table with three columns, "Name", "Email", and "Message".

2. **Get Airtable Credentials.**

   There are **2** environment variable you'll need to add your project to properly run the example:

   - `AIRTABLE_KEY`: Get Airtable API Key. [Airtable Docs](https://support.airtable.com/hc/en-us/articles/219046777-How-do-I-get-my-API-key-)
   - `AIRTABLE_DB`: Get the ID for the "Submissions" Base in interactive Airtable API docs. [Airtable Docs](https://airtable.com/api)

   You'll want to add these as environment variables when deploying to Gatsby Cloud. Don't forget to add them to the Preview variables if you plan to add a CMS preview integration.

3. **Start developing.**

   To get started, run `npm install` to add all necessary packages.

   When developing locally, you'll want to include the ENV variables in your `.env.development`. Read more about how Gatsby handles `.env` files and environment variables in the [Gatsby Docs](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/)

   ```shell
   cd examples/functions-airtable-form
   npm install
   npm run develop
   ```

4. **Open the code and start customizing!**

   Your site is now running at http://localhost:8000! You can use the UI on the index page to test the functions or directly access them at http://localhost:8000/api/airtable

   For this route, hitting the route with a POST request with the following body should submit a form response to your Airtable base:

   ```json
   {
     "name": "Sample Name",
     "email": "sample@example.com",
     "message": "Hello, World!"
   }
   ```

   Edit `src/pages/index.js` to see your site update in real-time!

5. **Deploy**

You can deploy this example on Gatsby Cloud by copying the example into a new repo and [connecting that to Gatsby Cloud](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/deploying-to-gatsby-cloud/#set-up-an-existing-gatsby-site).
