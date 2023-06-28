---
title: Adapters
---

## Introduction

Adapters are responsible for taking the production output from Gatsby and turning it into something your deployment platform understands. They make it easier to build and deploy Gatsby sites on any deployment platform.

Gatsby has different [rendering options](/docs/conceptual/rendering-options/) and features like Deferred Static Generation (DSG) and Server-Side Rendering (SSR) require more setup than classic Static Site Generation (SSG). Users can also set [HTTP headers](/docs/how-to/previews-deploys-hosting/headers/) or create [redirects](/docs/reference/config-files/actions/#createRedirect). Gatsby passes all the required information during the build to its adapters so that they can prepare these outputs for deployment.

This feature was added in `gatsby@5.X.0`.

## Finding adapters

You can use these official adapters:

- [gatsby-adapter-netlify](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-adapter-netlify) for [Netlify](https://www.netlify.com/)

To find additional community adapters, [search npm for `gatsby-adapter`](https://www.npmjs.com/search?q=gatsby-adapter-). 

Can't find an adapter for your platform? Consider [creating an adapter](/docs/how-to/previews-deploys-hosting/creating-an-adapter/) yourself.

## Using adapters

Use the `adapter` option inside `gatsby-config`:

```js:title=gatsby-config.js
const adapter = require("gatsby-adapter-foo")

module.exports = {
  adapter: adapter()
}
```

If the adapter accepts custom options, you can set them like this:

```js:title=gatsby-config.js
const adapter = require("gatsby-adapter-foo")

module.exports = {
  adapter: adapter({
    // Adapter options
  })
}
```

## Additional resources

- [Zero-Configuration Deployments](/docs/how-to/previews-deploys-hosting/zero-configuration-deployments/)
- [Creating an Adapter](/docs/how-to/previews-deploys-hosting/creating-an-adapter/)
