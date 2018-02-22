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

```
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`
});
```

Now the variables are available.

## Example

```
# Example .env.development file

API_URL=https://dev.example.com/api
```

```
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
