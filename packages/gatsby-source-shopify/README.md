<p align="center">
  <a href="https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-shopify/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Gatsby and gatsby-source-shopify are released under the MIT license." />
  </a>
  <a href="https://www.npmjs.com/package/gatsby-source-shopify">
    <img src="https://img.shields.io/npm/v/gatsby-source-shopify.svg" alt="Current npm package version." />
  </a>
  <a href="https://npmcharts.com/compare/gatsby-source-shopify?minimal=true">
    <img src="https://img.shields.io/npm/dm/gatsby-source-shopify.svg" alt="Downloads per month on npm." />
  </a>
  <a href="https://npmcharts.com/compare/gatsby-source-shopify?minimal=true">
    <img src="https://img.shields.io/npm/dt/gatsby-source-shopify.svg" alt="Total downloads on npm." />
  </a>
  <a href="https://gatsbyjs.com/contributing/how-to-contribute/">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=gatsbyjs">
    <img src="https://img.shields.io/twitter/follow/gatsbyjs.svg?label=Follow%20@gatsbyjs" alt="Follow @gatsbyjs" />
  </a>
</p>

# gatsby-source-shopify

A scalable solution for sourcing data from Shopify.

This plugin works by leveraging [Shopify's bulk operations API][bulk-operations], which allows us to process large amounts of data at once. This gives us a more resilient and reliable build process. It also enables incremental builds so that your site can build quickly when you change your data in Shopify.

## Getting started

This takes you through the minimal steps to see your Shopify data in your Gatsby site's GraphiQL explorer.

### Install

Install this plugin to your Gatsby site.

```
npm i gatsby-source-shopify@latest gatsby-plugin-image
```

### Configure

Add the plugin to your `gatsby-config.js`, e.g.

```js
require("dotenv").config()

module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-shopify",
      options: {
        apiKey: process.env.SHOPIFY_ADMIN_API_KEY,
        password: process.env.SHOPIFY_ADMIN_PASSWORD,
        storeUrl: process.env.SHOPIFY_STORE_URL,
      },
    },
    "gatsby-plugin-image",
  ],
}
```

### Retrieving API Information from Shopify

In Shopify admin, `SHOPIFY_STORE_URL` is the Store address you enter when logging into your Shopify account. This typically is in the format of `myshop.myshopify.com`.

Once logged into Shopify admin, navigate to the `Apps` page and click the link at the bottom to `Manage private apps`. This will allow you to turn on private apps and create an app that Gatsby will use to access Shopify's Admin API.

For the Private app name enter `Gatsby` (the name does not really matter). Add the following under the `Active Permissions for this App` section:

- `Read access` for `Products`
- `Read access` for `Product listings` if you want to use Shopify's Product Collections in your Gatsby site
- `Read access` for `Orders` if you want to use order information in your Gatsby site

**Note: Enabling Cart and Checkout features**

If you are planning on managing your cart within Gatsby you will also need to check the box next to `Allow this app to access your storefront data using the Storefront API` and make sure to check `Read and modify checkouts`. This source plugin does not require Shopify Storefront API access to work, however, this is needed to add items to a Shopify checkout before passing the user to Shopify's managed checkout workflow. See [Gatsby Starter Shopify](https://github.com/gatsbyjs/gatsby-starter-shopify) for an example.

Click the Save button and then click Create app to create your Private Shopify App. From there you can copy the API Key and Password from the Private app page and add them to your environment file for `SHOPIFY_ADMIN_API_KEY` and `SHOPIFY_ADMIN_PASSWORD` respectively.

### Fire it up

Run your site with `gatsby develop`. When the site builds successfully, you should see output like this:

```
You can now view test-site in the browser.
⠀
  http://localhost:8000/
⠀
View GraphiQL, an in-browser IDE, to explore your site's data and schema
⠀
  http://localhost:8000/___graphql
⠀
Note that the development build is not optimized.
To create a production build, use gatsby build
```

Now follow the second link to explore your Shopify data!

## Plugin options

`apiKey: string`

The admin API key for the Shopify store + app you're using

`password: string`

The admin password for the Shopify store + app you're using

`storeUrl: string`

Your Shopify store URL, e.g. some-shop.myshopify.com

`shopifyConnections: string[]`

An optional array of additional data types to source.

Accepted values: `'orders'`, `'collections'`

`downloadImages: bool`

Not set by default. If set to `true`, this plugin will download and process images during the build.

The plugin's default behavior is to fall back to Shopify's CDN.

`typePrefix: string`

Not set by default. If set to a string (example `MyStore`) node names will be `allMyStoreShopifyProducts` instead of `allShopifyProducts`.

`salesChannel: string`

Not set by default. If set to a string (example `My Private App Channel`), only products and collections that are active in that channel will be sourced. If no sales channel is provided, the default behavior is to source products that are available in the online store.

## Images

We offer two options for displaying Shopify images in your Gatsby site. The default option is to use the Shopify CDN along with [gatsby-plugin-image][gatsby-plugin-image], but you can also opt-in to downloading the images as part of the build process. Your choice will result in differences to the schema. Both options are explained below.

### Use Shopify CDN

This is the default behavior and is intended to be used in conjunction with [gatsby-plugin-image][gatsby-plugin-image]. In this case, querying for image data from your Gatsby site might look like this:

```gql
products: allShopifyProduct(
  sort: { fields: [publishedAt], order: ASC }
) {
  edges {
    node {
      id
      storefrontId
      featuredImage {
        id
        altText
        gatsbyImageData(width: 910, height: 910)
      }
    }
  }
}
```

You could then display the image in your component like this:

```jsx
import { GatsbyImage } from "gatsby-plugin-image"

function ProductListing(product) {
  return (
    <GatsbyImage
      image={product.featuredImage.gatsbyImageData}
      alt={product.featuredImage.altText}
    />
  )
}
```

### Use runtime images

If you get Shopify images at runtime that don't have the `gatsbyImageData` resolver, for example from the cart or Storefront API, you can use the `getShopifyImage` function to create an imagedata object to use with `<GatsbyImage>`.

It expects an `image` object that contains the properties `width`, `height` and `originalSrc`, such as [a Storefront API `Image` object](https://shopify.dev/docs/storefront-api/reference/common-objects/image).

```jsx
import { GatsbyImage } from "gatsby-plugin-image"
import { getShopifyImage } from "gatsby-source-shopify"

function CartImage(storefrontProduct) {
  // This is data from Storefront, not from Gatsby
  const image = storefrontProduct.images.edges[0].node
  const imageData = getShopifyImage({
    image,
    layout: "fixed",
    width: 200,
    height: 200,
  })

  return <GatsbyImage image={imageData} alt={image.altText} />
}
```

### Download up front

If you wish to download your images during the build, you can specify `downloadImages: true` as a plugin option:

```js
require("dotenv").config()

module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-shopify",
      options: {
        apiKey: process.env.SHOPIFY_ADMIN_API_KEY,
        password: process.env.SHOPIFY_ADMIN_PASSWORD,
        storeUrl: process.env.SHOPIFY_STORE_URL,
        downloadImages: true,
      },
    },
    "gatsby-plugin-image",
  ],
}
```

This will make the build take longer but will make images appear on your page faster at runtime. If you use this option, you can query for your image data like this.

```gql
products: allShopifyProduct(
  sort: { fields: [publishedAt], order: ASC }
) {
  edges {
    node {
      id
      storefrontId
      featuredImage {
        id
        localFile {
          childImageSharp {
            gatsbyImageData(width: 910, height: 910, placeholder: BLURRED)
          }
        }
        altText
      }
    }
  }
}
```

Then you would use `gatsby-plugin-image` to render the image:

```js
import { GatsbyImage, getImage } from "gatsby-plugin-image"

function ProductListing(product) {
  const image = getImage(product.featuredImage.localFile)

  return <GatsbyImage image={image} alt={product.featuredImage.altText} />
}
```

## Limitations

The bulk API was chosen for resiliency, but it comes with some limitations. For a given store + app combination, only one bulk operation can be run at a time, so this plugin will wait for in-progress operations to complete. If your store contains a lot of data and there are multiple developers doing a clean build at the same time, they could be waiting on each other for a significant period of time.

A possible workaround is to use a smaller test store for development so bulk operations finish faster and never compete with production builds.

## Development

This is a yarn workspace with the plugin code in a `plugin/` folder and a test Gatsby site in the `test-site/` folder. After cloning the repo, you can run `yarn` from the project root and all dependencies for both the plugin and the test site will be installed. Then you compile the plugin in watch mode and run the test site. In other words,

1. From the project root, run `yarn`
1. `cd plugin`
1. `yarn watch`
1. Open a new terminal window to the `test-site/` folder
1. `yarn start`

Subsequent builds will be incremental unless you run `yarn clean` from the `test-site/` folder to clear Gatsby's cache.

You can also test an incremental build without restarting the test site by running `yarn refresh` from the `test-site/` folder.

[bulk-operations]: https://shopify.dev/tutorials/perform-bulk-operations-with-admin-api
[gatsby-plugin-image]: https://www.npmjs.com/package/gatsby-plugin-image

## Migrating from v4 to v5

We don't currently have a migration guide but you can find some tips in [this issue](https://github.com/gatsbyjs/gatsby-source-shopify/issues/151). Please read through it and add a comment with any additional information you might have.
