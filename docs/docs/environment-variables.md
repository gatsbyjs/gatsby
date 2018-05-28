---
title: "Environment Variables"
---

You can easily provide environment variables to your site.

For JavaScript loaded into the browser, just add a `.env.development` and/or
`.env.production` file in your root folder for development or production builds
respectively. The environment variables are embedded during build time using
Webpack's [DefinePlugin](https://webpack.js.org/plugins/define-plugin/). Because
these variables are provided at build time, you will need restart your dev
server or rebuild your site after changing them.

In addition to `.env.*` files, any variable in the environment prefixed with
`GATSBY_` will be made available in browser JavaScript.

To add environment variables for the JavaScript run in node.js, e.g. in
`gatsby-config.js` or `gatsby-node.js`, you can add environment variables the
normal ways e.g. when calling gatsby on the command line or by adding
environment variables through your hosting/build tool.

If you want to access variables in `.env.*` files in your node.js code, use the
NPM package [dotenv](https://www.npmjs.com/package/dotenv). Install the package and
require it in your `gatsby-config.js` or `gatsby-node.js` the following way on top of your file:

```javascript
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});
```

Now the variables are available.

## Example

```shell
# Example .env.development file

API_URL=https://dev.example.com/api
```

```shell
# Example .env.production file

API_URL=https://example.com/api
```

These variables will be available to your site as `process.env.API_URL`.

## Example

```
GATSBY_ASSETS_URL=http://s3.amazonaws.com/bucketname
```

```jsx
// usage
render() {
  return (
    <div>
      <img src={`${process.env.GATSBY_ASSETS_URL}/logo.png`} alt="Logo" />
    </div>
  )
}
```

> You can not override certain environment variables as some are used internally
> for optimizations during build

Reserved environment variables:

* `NODE_ENV`
* `PUBLIC_DIR`

## Additional Environments (Staging, Test, etc)

`NODE_ENV` is a reserved environment variable in Gatsby as it is needed by the build system to make key optimizations when compiling React and other modules. For this reason it is advised to make use of a secondary environment variable for additional environment support.

For instance. If you would like to add a staging environment with a custom Google Analytics Tracking ID. You can add `.env.staging` at the root of your project with the following modification to your `gatsby-config.js`

### Example

```shell
# .env.staging
GATSBY_GA_TRACKING_ID="UA-1234567890"
```

```javascript
// gatsby-config.js

let activeEnv = process.env.ACTIVE_ENV;

if (!activeEnv) {
  activeEnv = "development";
}

require("dotenv").config({
  path: `.env.${activeEnv}`,
});

module.exports = {
  siteMetadata: {
    title: "Gatsby Default Starter",
  },
  plugins: [
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: process.env.GATSBY_GA_TRACKING_ID,
        // Puts tracking script in the head instead of the body
        head: false,
        // Setting this parameter is optional
        anonymize: true,
        // Setting this parameter is also optional
        respectDNT: true,
      },
    },
  ],
};
```

Local testing of staging is as simple as

```
ACTIVE_ENV=staging gatsby develop
```
