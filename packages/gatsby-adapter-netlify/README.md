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
- Gatsby Image and File CDN (optional, requires configuration, see [`imageCDN` option](#imagecdn))

This adapter is part of Gatsby's [zero-configuration deployments](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/zero-configuration-deployments/) feature and will be installed automatically on Netlify. You can add `gatsby-adapter-netlify` to your `dependencies` and `gatsby-config` to have more robust installs and to be able to change its options.

## Installation

```shell
npm install gatsby-adapter-netlify
```

## Usage

Add `gatsby-adapter-netlify` to your [`gatsby-config`](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/) and configure the [`adapter`](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/#adapter) option.

```js
const adapter = require("gatsby-adapter-netlify").default

module.exports = {
  adapter: adapter({
    excludeDatastoreFromEngineFunction: false,
    imageCDN: false,
  }),
}
```

### Options

#### excludeDatastoreFromEngineFunction

(optional, default: `false`)

If `true`, Gatsby will not include the LMDB datastore in the serverless functions used for SSR/DSG. Instead, it will upload the datastore to Netlify's CDN and download it on first load of the functions.

You can also enable this option by setting `GATSBY_EXCLUDE_DATASTORE_FROM_BUNDLE=true` environment variable (useful when using [zero-configuration deployments](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/zero-configuration-deployments/))

#### imageCDN

(optional, default: `false`)

If `true` instead of downloading and processing images at build time, it defers processing until request time using [Netlify Image CDN](https://docs.netlify.com/image-cdn/overview/). This can greatly improve build times for sites with remote images, such as those that use a CMS.

You can also enable this option by setting `NETLIFY_IMAGE_CDN=true` environment variable (useful when using [zero-configuration deployments](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/zero-configuration-deployments/))

You will need additional configuration in your `netlify.toml` configuration file to allow external domains for images. See [Netlify Image CDN Remote Path docs](https://docs.netlify.com/image-cdn/overview/#remote-path) for more information.

Exact Remote Path regular expressions to use will depend on CMS you use and possibly your configuration of it.

- `gatsby-source-contentful`:

  ```toml
  [images]
  remote_images = [
    # <your-contentful-space-id> is specified in the `spaceId` option for the
    # gatsby-source-contentful plugin in your gatsby-config file.
    "https://images.ctfassets.net/<your-contentful-space-id>/.*"
  ]
  ```

- `gatsby-source-drupal`:

  ```toml
  [images]
  remote_images = [
    # <your-drupal-base-url> is speciafied in the `baseUrl` option for the
    # gatsby-source-drupal plugin in your gatsby-config file.
    "<your-drupal-base-url>/.*"
  ]
  ```

- `gatsby-source-wordpress`:

  ```toml
  [images]
  remote_images = [
    # <your-wordpress-url> is specified in the `url` option for the
    # gatsby-source-wordpress plugin in your gatsby-config file.
    # There is no need to include `/graphql in the path here`
    "<your-wordpress-url>/.*"
  ]
  ```

Above examples are the most likely ones to be needed. However if you configure
your CMS to host assets on different domain or path, you might need to adjust
the patterns accordingly.

If you are using recent versions of Contentful, Drupal or Wordpress source plugins, Gatsby and Netlify Adapter will automatically detect missing Remote Path patterns and will warn you about it and provide the required patterns to add to your configuration.
