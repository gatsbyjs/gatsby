---
title: Building an e-commerce site with Shopify
---

In this tutorial, you will setup a new Gatsby website that fetches product data from [Shopify](https://www.shopify.com). It will display a list of products on the home page, and create a page for every product in the store.

If you are already comfortable with Gatsby and Shopify, you might want to check out the [Gatsby Shopify starter](https://www.gatsbyjs.org/starters/AlexanderProd/gatsby-shopify-starter/), which provides many of the same features as this sample site.

## Setting up your Shopify account

1. Create a new [Shopify account](https://www.shopify.com) and store if you don't have one.
2. Create a Private App in your store by navigating to **Apps**, then "Manage private apps"
3. Create a new private app and enable the [Shopify Storefront API](https://help.shopify.com/en/api/storefront-api). Make sure to also grant access to read product and customer tags.

## Set up the Gatsby Shopify plugin

1. If you do not already have one ready, [create a Gatsby site](https://www.gatsbyjs.org/docs/quick-start).

2. Install the `gatsby-source-shopify` plugin and `shopify-buy` package.

```shell
npm install --save gatsby-source-shopify shopify-buy
```

3. Enable and configure the plugin in your `gatsby-config.js` file.

```javascript:title=/gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-shopify`,
    options: {
      // The domain name of your Shopify shop.
      shopName: `[some-shop].myshopify.com`,

      // The storefront access token
      accessToken: `[token]`,
    },
  },
]
```

4. Run `gatsby develop` and make sure the site compiles successfully.

## Querying Shopify data and listing products

Open the Gatsby GraphiQL interface by visiting `http://localhost:8000/___graphql`. You should see several new types of nodes in the Explorer tab, like `allShopifyProduct`. To query all products in your store sorted by title, try running the query:

```graphql
{
  allShopifyProduct(sort: { fields: [title] }) {
    edges {
      node {
        title
        images {
          originalSrc
        }
        shopifyId
        description
        availableForSale
        priceRange {
          maxVariantPrice {
            amount
          }
          minVariantPrice {
            amount
          }
        }
      }
    }
  }
}
```

To add a simple listing of products to your site's homepage, edit `/src/pages/index.js`:

```jsx:title=/src/pages/index.js
import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"

const IndexPage = ({ data }) => (
  <Layout>
    <h1>Products</h1>
    {data.allShopifyProduct.edges.map(({ node }) => (
      <div key={node.shopifyId}>
        <h3>
          <Link to={`/product/${node.handle}`}>{node.title}</Link>
          {" - "}${node.priceRange.minVariantPrice.amount}
        </h3>
        <p>{node.description}</p>
      </div>
    ))}
  </Layout>
)

export default IndexPage

export const query = graphql`
  {
    allShopifyProduct(sort: { fields: [title] }) {
      edges {
        node {
          title
          shopifyId
          description
          handle
          priceRange {
            minVariantPrice {
              amount
            }
          }
        }
      }
    }
  }
`
```

## Generating a page for each product

You can [programatically create pages](/tutorial/part-seven/) in Gatsby for every product in your Shopify store. Since shopify already provides a `handle` field for use in URLs, you can use it to generate unique addresses for each product.

Create a template for your product pages by adding a new file, `/src/templates/product.js`:

```jsx:title=/src/templates/product.js
import React from "react"

import Layout from "../components/layout"

const ProductTemplate = ({ pageContext }) => {
  const { product } = pageContext
  return (
    <Layout>
      <h1>{product.title}</h1>
      <div>{product.description}</div>
    </Layout>
  )
}

export default ProductTemplate
```

Edit your `gatsby-node.js` file and add the following code. This queries all Shopify products with GraphQL, then creates a page using the template in `product.js`. Each page gets assigned a URL in the format of `/products/[product handle]`.

```javascript:title=/gatsby-node.js
const path = require(`path`)
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  // Query for all products in Shopify
  const result = await graphql(`
    query {
      allShopifyProduct(sort: { fields: [title] }) {
        edges {
          node {
            title
            images {
              originalSrc
            }
            shopifyId
            handle
            description
            availableForSale
            priceRange {
              maxVariantPrice {
                amount
              }
              minVariantPrice {
                amount
              }
            }
          }
        }
      }
    }
  `)
  // Iterate over all products and create a new page using a template
  result.data.allShopifyProduct.edges.forEach(({ node }) => {
    createPage({
      path: `/product/${node.handle}`,
      component: path.resolve(`./src/templates/product.js`),
      context: {
        product: node,
      },
    })
  })
}
```

## Additional Resources

- [Gatsby Shopify Starter](/starters/AlexanderProd/gatsby-shopify-starter/)
