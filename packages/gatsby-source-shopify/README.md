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
  - 🛠 [Priority builds](#priority-builds)
- 🔌 [Plugin options](#plugin-options)
- 🎨 [Images](#images)
  - 🛍️ [Use Shopify CDN](#use-shopify-cdn)
  - ⬇️ [Use downloaded images](#use-downloaded-images)
  - 🚥 [Use run-time images](#use-run-time-images)
  - 🖼️ [Displaying images](#displaying-images)
- 🚨 [Limitations](#limitations)
- 💾 [Migration guide](#migration-guide)

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
        password: process.env.SHOPIFY_APP_PASSWORD,
        storeUrl: process.env.GATSBY_MYSHOPIFY_URL,
        salesChannel: process.env.SHOPIFY_APP_ID, // Optional but recommended
      },
    },
    "gatsby-plugin-image",
  ],
}
```
💡 Note: This plugin has a peer dependency on `gatsby-plugin-image` and will fail to build without it.

<div id="retrieving-api-information-from-shopify"></div>

### Retrieving API Information from Shopify

`GATSBY_MYSHOPIFY_URL` is the Store address you enter when logging into your Shopify account. This is in the format of `{store}.myshopify.com`.

Once logged into Shopify admin, navigate to the `Apps` page and click the link at the top to `Develop apps`. If you haven't yet, an admin on the Shopify store will need to enable private app development. This will allow you to create an app that Gatsby will use to access Shopify's Admin API.

For the Private app name enter `Gatsby` (the name does not really matter). Add the following under the `Active Permissions for this App` section:

- `Read access` for `Files`
- `Read access` for `Products`
- `Read access` for `Product listings` if you enable `collections` in the plugin options
- `Read access` for `Orders` if you enable `orders` in the plugin options
- `Read access` for `Inventory` and `Locations` if you enable `locations` in the plugin options

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

<div id="priority-builds"></div>

### Priority builds

Because of the limiations of the Shopify Bulk API we have included logic in this plugin to determine which builds are high priority for a given Shopify site. This allows us to pause deploy preview builds while production builds are running while using the same Shopify App. The following logic determines whether a build is priority or not:

```js
const isPriorityBuild = process.env.GATSBY_IS_PREVIEW !== `true` && process.env.GATSBY_IS_PR_BUILD !== `true`
```

These environment variables are set by default by Gatsby Cloud, but we are working diligently to make this plugin workby default with Netlify and local development as well, and are looking at the option to override these defaults in the plugin options.

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

Not set by default. If set to a string (example `My Sales Channel`), only products, variants, collections and locations that are published to that channel will be sourced. If you want to filter products by a Private App instead of Public App or default sales channel, you have to provide the App ID instead of sales channel name. You can find this in the same place as the Shopify App Password.

💡 Note: The `salesChannel` plugin option defaults to the value of `process.env.GATBSY_SHOPIFY_SALES_CHANNEL`. If that value is not set the plugin will source only objects that are published to the `online store` sales channel. 


<div id="images"></div>

## Images

We offer two options for displaying Shopify images in your Gatsby site. The default option is to use the Shopify CDN along with [gatsby-plugin-image][gatsby-plugin-image], but you can also opt-in to downloading the images as part of the build process. Your choice will result in differences to the schema. Both options are explained below.

<div id="use-shopify-cdn"></div>

### Use Shopify CDN

This is the default behavior and is intended to be used in conjunction with [gatsby-plugin-image][gatsby-plugin-image].

#### Product Featured Media
This query is commonly used on collection pages to only load necessary image data.
```graphql
query {
  products: allShopifyProduct {
    nodes {
      featuredMedia {
        preview {
          image {
            gatsbyImageData
          }
        }
      }
    }
  }
}
```

#### Product Media Previews
This query is commonly used on product pages to display images for all media types.
```graphql
query {
  products: allShopifyProduct {
    nodes {
      media {
        preview {
          image {
            gatsbyImageData
          }
        }
      }
    }
  }
}
```

💡 Note: This query will return images for all media types including videos.

#### Product Media Previews and Videos
This query is commonly used on product pages to display images alongside videos.
```graphql
query {
  products: allShopifyProduct {
    nodes {
      media {
        preview {
          image {
            gatsbyImageData
          }
        }
        ... on ShopifyExternalVideo {
          embeddedUrl
          host
        }
        ... on ShopifyVideo {
          sources {
            format
            height
            url
            width
          }
        }
      }
    }
  }
}
```

💡 Note: Previous versions of this plugin exposed the `images` field on products. Although it made the plugin easier to interact with, it made it impossible to add videos to your products. The new version of the plugin exposes the `media` field directly, allowing you to query for all of the images, videos and 3D renderings that Shopify supports.

<div id="use-downloaded-images"></div>

### Use downloaded images

If you wish to download your images during the build, you can specify `downloadImages: true` as a plugin option:

```js:title=gatsby-config.js
require("dotenv").config()

module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-shopify",
      options: {
        password: process.env.SHOPIFY_APP_PASSWORD,
        storeUrl: process.env.GATSBY_MYSHOPIFY_URL,
        downloadImages: true,
      },
    },
    "gatsby-plugin-image",
    "gatsby-transformer-sharp", // Required when downloadImages is true
  ],
}
```

💡 Note: This will make the build take longer but will make images appear on your page faster at runtime.

#### Media with local files
The following fragment will work with any of the `preview` fields in the [runtime images](#use-run-time-images) section.
```graphql
fragment MediaImageLocalFile on ShopifyMediaPreviewImage {
  image {
    localFile {
      childImageSharp {
        gatsbyImageData
      }
    }
  }
}
```

<div id="use-run-time-images"></div>

### Use run-time images

If you get Shopify images at run-time that don't have the `gatsbyImageData` resolver, for example from the cart or Storefront API, you can use the `getShopifyImage` function to create an image-data object to use with `<GatsbyImage>`.

It expects an `image` object that contains the properties `width`, `height` and `originalSrc`, such as [a Storefront API `Image` object](https://shopify.dev/docs/storefront-api/reference/common-objects/image).

```js
import { getShopifyImage } from "gatsby-source-shopify"

function getCartImage(storefrontProduct) {
  const image = storefrontProduct.images.edges[0].node;
  const imageData = getShopifyImage({
    image,
    width: 200,
    height: 200,
    layout: "fixed",
  });

  return imageData;
}
```

<div id="displaying-images"></div>

### Displaying images

```jsx
import { GatsbyImage } from "gatsby-plugin-image";
import { getShopifyImage } from "gatsby-source-shopify";

const ShopifyProductImage = ({ product }) => (
  <GatsbyImage src={product.featuredMedia.preview.image.gatsbyImageData} />
);

const DownloadedProductImage = ({ product }) => (
  <GatsbyImage src={product.featuredMedia.preview.image.localFile.childImageSharp.gatsbyImageData} />
);

const RuntimeProductImage = ({ storefrontProduct }) => {
  const gatsbyImageData = getShopifyImage({
    image: storefrontProduct.images.edges[0],
    width: 800,
    height: 800,
    layout: 'fixed',
  });
 
  return (
    <GatsbyImage src={gatsbyImageData} />
  );
};

const RuntimeLineItemImage = ({ storefrontLineItem }) => {
  const gatsbyImageData = getShopifyImage({
    image: storefrontLineItem.variant.image,
    width: 800,
    height: 800,
    layout: 'fixed',
  });
 
  return (
    <GatsbyImage src={gatsbyImageData} />
  );
};
```

Please refer to the [gatsby-plugin-image docs](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-image#dynamic-images) for more information on how to display images on your Gatsby site.

<div id="limitations"></div>

## Limitations

The bulk API was chosen for resiliency, but it comes with some limitations, the most important of which is that a given Shopify App can only have one bulk operation running at a time. Because of this we recommend that you have at least two Shopify Apps for each Shopify Store, one for production and another for local development, in order to avoid potential build issues.

<div id="migration-guide"></div>

## Migration guide

We don't currently have a migration guide for v7 of `gatsby-source-shopify`, but it is in the works and will be released shortly after the release of v7.
