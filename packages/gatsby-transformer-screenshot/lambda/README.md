# About

This is the Lambda function that gatsby-transformer-screenshot uses to take screenshots. See [the plugin README](../README.md) for instructions on deploying this.

## Manual testing

The files in the `__manual_tests__` directory can be used to test locally or test the deployed version on AWS.

Note that successful runs will cache the screenshot. Be sure to change the `SITE_URL` to re-test screenshot functionality.

### Local

To test the Puppeteer functionality locally:

`TEST_WITH_LOCAL_FS=true SITE_URL=https://en.wikipedia.org/wiki/Wool node __manual-tests__/local-test.js`

Screenshots will be saved to `./screenshots`.

### Remote

To test the function deployed at `<url to Lambda endpoint>`:

`SCREENSHOT_ENDPOINT=<URL to Lambda endpoint> SITE_URL=https://en.wikipedia.org/wiki/Iron node __manual-tests__/remote-test.js`
