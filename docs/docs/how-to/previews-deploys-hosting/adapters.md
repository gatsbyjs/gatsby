---
title: Adapters
---

## Introduction

Adapters are responsible for taking the production output from Gatsby and turning it into something your deployment platform understands. They make it easier to build and deploy Gatsby on any deployment platform.

Gatsby has different [rendering options](/docs/conceptual/rendering-options/) and features like DSG and SSR require more setup than classic SSG. Users can also set [HTTP headers](/docs/how-to/previews-deploys-hosting/headers/) or create [redirects](/docs/reference/config-files/actions/#createRedirect). Gatsby passes all the required information during the build to its adapters so that they can _adapt_ these outputs for deployment.

## Prerequisites

- A Gatsby project set up with `gatsby@5.X.0` or later. (Need help creating one? Follow the [Quick Start](/docs/quick-start/))

## Finding adapters

You can use these official adapters:

- [gatsby-adapter-netlify](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-adapter-netlify) for [Netlify](https://www.netlify.com/)

You can [search npm for `gatsby-adapter`](https://www.npmjs.com/search?q=gatsby-adapter-) to find additional community adapters.

## Using adapters

Use the `adapter` option inside `gatsby-config`:

```js:title=gatsby-config.js
const adapter = require("gatsby-adapter-foo")

module.exports = {
  adapter: adapter()
}
```

If your adapter is accepting custom options, you can set them like so:

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
