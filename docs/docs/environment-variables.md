---
title: "Environment Variables"
---

You can easily provide environment variables to your site. 

For JavaScript loaded into the browser, just add a `.env.development` and/or `.env.production` file in your root folder for development or production builds respectively. The environment variables are embedded during build time using Webpack's [DefinePlugin](https://webpack.js.org/plugins/define-plugin/). Because these variables are provided at build time, you will need restart your dev server or rebuild your site after changing them.

To add environment variables for the JavaScript run in node.js, e.g. in `gatsby-config.js` or `gatsby-node.js`, you can use the NPM package [dotenv](https://www.npmjs.com/package/dotenv). Once you've installed dotenv and followed their setup instructions, you can use your environment variables in the same way as shown in the example below.

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

In addition any variable in the environment prefixed with `GATSBY_` will be available.

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



> You can not override certain environment variables as some are used internally for optimizations during build

Reserved environment variables:

- `NODE_ENV`
- `PUBLIC_DIR`
