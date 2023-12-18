# adapters

E2E testing suite for Gatsby's [adapters](http://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/adapters/) feature.
If possible, run the tests locally with a CLI. Otherwise deploy the site to the target platform and run Cypress on the deployed URL.

Adapters being tested:

- [gatsby-adapter-netlify](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-adapter-netlify)

## Usage

- To run all tests, use `yarn test`
- To run individual tests, use `yarn test:%NAME` where `test:%NAME` is the script, e.g. `yarn test:netlify`
- If you want to open Cypress locally as a UI, you can run the `:debug` scripts. For example, `yarn test:netlify:debug` to test the Netlify Adapter with Cypress open.

## Netlify as Target Platform

- If deploying the site to Netlify as the target platform, you can run `yarn test:netlify` with the following environment variables set, `E2E_ADAPTERS_NETLIFY_SITE_ID=<yourSiteId>`, `NETLIFY_AUTH_TOKEN=<yourAuthToken>`, and `GATSBY_TEST_SKIP_CLEANUP=1`.
- You can use any Netlify site that you have access to or create an empty site with the Netlify CLI `ntl sites:create`.
- Setting `GATSBY_TEST_SKIP_CLEANUP` to `1`, prevents the deploy from being deleted after the test run so you can iterate on the tests using the same deploy.
- During the initial run, the `DEPLOY_URL` is logged. You can use this to run the tests for debugging like so:
  `TRAILING_SLASH=always ADAPTER=netlify DEPLOY_URL=<deployUrlFromPreviousCommand> yarn test:netlify:debug`

### Adding a new adapter

- Add a new Cypress config inside `cypress/configs`
- Add a new `test:` script that should run `start-server-and-test`. You can check what e.g. `test:netlify` is doing.
- Run the Cypress test suites that should work. If you want to exclude a spec, you can use Cypress' [excludeSpecPattern](https://docs.cypress.io/guides/references/configuration#excludeSpecPattern)

## External adapters

As mentioned in [Creating an Adapter](https://gatsbyjs.com/docs/how-to/previews-deploys-hosting/creating-an-adapter/#testing) you can use this test suite for your own adapter.

Copy the whole `adapters` folder, and follow [adding a new adapter](#adding-a-new-adapter).
