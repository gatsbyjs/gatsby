<p align="center">
  <img width="560" height="328" src="https://user-images.githubusercontent.com/51924260/122227148-a38f1400-ce84-11eb-945c-e51e896b519b.png">
</p>

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

<br />

- 🏃‍ [Getting started](#getting-started)
  - 🔩 [Install](#install)
  - 🔑 [Configure](#configure)
  - 🙌 [Retrieving API Information from Shopify](#retrieving-api-information-from-shopify)
    - 🛒 [Enabling Cart and Checkout features](#enabling-cart-and-checkout-features)
  - 🔥 [Fire it up](#fire-it-up)
- 🔌 [Plugin options](#plugin-options)
- 🎨 [Images](#images)
  - 🚀 [Use Shopify CDN](#use-shopify-cdn)
  - 🚥 [Use runtime images](#use-runtime-images)
  - 🖼️ [Download images up front](#download-images-up-front)
- 🚨 [Limitations](#limitations)
- 🛠 [Development](#development)
- 💾 [Migrating from v4 to v5](#migrating-from-v4-to-v5)

# gatsby-source-shopify

A scalable solution for sourcing data from Shopify.

This plugin works by leveraging [Shopify's bulk operations API][bulk-operations], which allows it to process large amounts of data at once. This gives it a more resilient and reliable build process. It also enables incremental builds so that your site can build quickly when you change your data in Shopify.

<div id="getting-started"></div>

## Getting started

This takes you through the minimal steps to see your Shopify data in your Gatsby site's GraphiQL explorer.

<div id="install"></div>

### Install

Install this plugin to your Gatsby site.

```shell
npm install gatsby-source-shopify
```

<div id="configure"></div>

### Configure

Add the plugin to your `gatsby-config.js`:

```js:title=gatsby-config.js
require("dotenv").config()

module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-shopify",
      options: {
        password: process.env.SHOPIFY_ADMIN_PASSWORD,
        storeUrl: process.env.SHOPIFY_STORE_URL,
      },
    },
    "gatsby-plugin-image",
  ],
}
```

<div id="retrieving-api-information-from-shopify"></div>

### Retrieving API Information from Shopify

In Shopify admin, `SHOPIFY_STORE_URL` is the Store address you enter when logging into your Shopify account. This typically is in the format of `myshop.myshopify.com`.

Once logged into Shopify admin, navigate to the `Apps` page and click the link at the bottom to `Manage private apps`. This will allow you to turn on private apps and create an app that Gatsby will use to access Shopify's Admin API.

For the Private app name enter `Gatsby` (the name does not really matter). Add the following under the `Active Permissions for this App` section:

- `Read access` for `Products`
- `Read access` for `Product listings` if you want to use Shopify's Product Collections in your Gatsby site
- `Read access` for `Orders` if you want to use order information in your Gatsby site

<div id="enabling-cart-and-checkout-features"></div>

#### Enabling Cart and Checkout features

If you are planning on managing your cart within Gatsby you will also need to check the box next to `Allow this app to access your storefront data using the Storefront API` and make sure to check `Read and modify checkouts`. This source plugin does not require Shopify Storefront API access to work, however, this is needed to add items to a Shopify checkout before passing the user to Shopify's managed checkout workflow. See [Gatsby Starter Shopify](https://github.com/gatsbyjs/gatsby-starter-shopify) for an example.

<div id="fire-it-up"></div>

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

<div id="plugin-options"></div>

## Plugin options

`password: string`

The admin password for the Shopify store + app you're using

`storeUrl: string`

Your Shopify store URL, e.g. some-shop.myshopify.com

`shopifyConnections: string[]`

An optional array of additional data types to source.

Accepted values: `'orders'`, `'collections'`, `'locations'`

`downloadImages: bool`

Not set by default. If set to `true`, this plugin will download and process images during the build.

The plugin's default behavior is to fall back to Shopify's CDN.

`typePrefix: string`

Not set by default. If set to a string (example `MyStore`) node names will be `allMyStoreShopifyProducts` instead of `allShopifyProducts`.

`salesChannel: string`

Not set by default. If set to a string (example `My Sales Channel`), only products and collections that are active in that channel will be sourced. If no sales channel is provided, the default behavior is to source products that are available in the online store.

Note: If you set up your site with the Gatsby Cloud Public App integration, `salesChannel` is set for you.

Note: If you want to filter products by a Private App instead of Public App or default sales channel, you have to provide App ID instead of sales channel name.

<div id="images"></div>

## Images

We offer two options for displaying Shopify images in your Gatsby site. The default option is to use the Shopify CDN along with [gatsby-plugin-image][gatsby-plugin-image], but you can also opt-in to downloading the images as part of the build process. Your choice will result in differences to the schema. Both options are explained below.

<div id="use-shopify-cdn"></div>

### Use Shopify CDN

This is the default behavior and is intended to be used in conjunction with [gatsby-plugin-image][gatsby-plugin-image]. In this case, querying for image data from your Gatsby site might look like this:

```graphql
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

<div id="use-runtime-images"></div>

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

<div id="download-images-up-front"></div>

### Download images up front

If you wish to download your images during the build, you can specify `downloadImages: true` as a plugin option:

```js:title=gatsby-config.js
require("dotenv").config()

module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-shopify",
      options: {
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

```graphql
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

<div id="limitations"></div>

## Limitations

The bulk API was chosen for resiliency, but it comes with some limitations. For a given store + app combination, only one bulk operation can be run at a time, so this plugin will wait for in-progress operations to complete. If your store contains a lot of data and there are multiple developers doing a clean build at the same time, they could be waiting on each other for a significant period of time.

<div id="development"></div>

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

<div id="migrating-from-v4-to-v5"></div>

## Migrating from v4 to v5

We don't currently have a migration guide but you can find some tips in [this issue](https://github.com/gatsbyjs/gatsby-source-shopify/issues/151). Please read through it and add a comment with any additional information you might have.
