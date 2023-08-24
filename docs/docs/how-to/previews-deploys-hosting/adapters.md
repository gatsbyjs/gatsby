---
title: Adapters
---

## Introduction

Adapters are responsible for taking the production output from Gatsby and turning it into something your deployment platform understands. They make it easier to build and deploy Gatsby sites on any deployment platform.

Gatsby has different [rendering options](https://www.gatsbyjs.com/docs/conceptual/rendering-options/) and features like Deferred Static Generation (DSG) and Server-Side rendering (SSR) require more setup than classic static site generation (SSG). Users can also set [HTTP headers](/docs/docs/how-to/previews-deploys-hosting/headers.md) or create [redirects](https://www.gatsbyjs.com/docs/reference/config-files/actions/#createRedirect).

Gatsby passes all the required information during the build to adapters to prepare these outputs for deployment on a specific platform. Here are some of the actions an adapter automatically takes:

- Applies HTTP headers to assets
- Applies redirects and rewrites. The adapter can also create its own redirects or rewrites if necessary, for example to map serverless functions to internal URLs.
- Wraps serverless functions coming from Gatsby with platform-specific code (if necessary). Gatsby will produce [Express](https://expressjs.com/)-like handlers.
- Apply trailing slash behavior and path prefix to URLs
- Possibly uploads assets to CDN

This feature was added in `gatsby@5.12.0`.

## Finding adapters

You can use these official adapters:

- [gatsby-adapter-netlify](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-adapter-netlify) for [Netlify](https://www.netlify.com/)

To find additional community adapters, [search npm for `gatsby-adapter`](https://www.npmjs.com/search?q=gatsby-adapter-).

Can't find an adapter for your platform? Consider [creating an adapter](/docs/docs/how-to/previews-deploys-hosting/creating-an-adapter.md) yourself.

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

- [Zero-Configuration Deployments](/docs/docs/how-to/previews-deploys-hosting/zero-configuration-deployments.md)
- [Creating an Adapter](/docs/docs/how-to/previews-deploys-hosting/creating-an-adapter.md)
