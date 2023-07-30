# gatsby-adapter-netlify

Gatsby [adapter](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/adapters/) for [Netlify](https://www.netlify.com/).

This adapter enables following features on Netlify:

- [Redirects](https://www.gatsbyjs.com/docs/reference/config-files/actions/#createRedirect)
- [HTTP Headers](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/headers/)
- Application of [default caching headers](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/caching/)
- [Deferred Static Generation (DSG)](https://www.gatsbyjs.com/docs/how-to/rendering-options/using-deferred-static-generation/)
- [Server-Side Rendering (SSR)](https://www.gatsbyjs.com/docs/how-to/rendering-options/using-server-side-rendering/)
- [Gatsby Functions](https://www.gatsbyjs.com/docs/reference/functions/)
- Caching of builds between deploys

This adapter is part of Gatsby's [zero-configuration deployments](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/zero-configuration-deployments/) feature and will be installed automatically on Netlify. You can add `gatsby-adapter-netlify` to your `dependencies` and `gatsby-config` to have more robust installs and to be able to change its options.

## Installation

```shell
npm install gatsby-adapter-netlify
```

## Usage

Add `gatsby-adapter-netlify` to your [`gatsby-config`](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/) and configure the [`adapter`](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/#adapter) option.

```js
const adapter = require("gatsby-adapter-netlify")

module.exports = {
  adapter: adapter({
    excludeDatastoreFromEngineFunction: false,
  }),
}
```

### Options

**excludeDatastoreFromEngineFunction** (optional, default: `false`)

If `true`, Gatsby will not include the LMDB datastore in the serverless functions used for SSR/DSG. Instead, it will upload the datastore to Netlify's CDN and download it on first load of the functions.
