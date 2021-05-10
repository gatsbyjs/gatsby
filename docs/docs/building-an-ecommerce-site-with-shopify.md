---
title: Building an E-commerce site with Shopify
---

In this tutorial, you will setup a new Gatsby website that fetches product data from [Shopify](https://www.shopify.com). The site displays a list of all products on a product listing page, and a page for every product in the store.

If you are already comfortable with Gatsby and Shopify, you might want to check out the [Gatsby Shopify starter](https://www.gatsbyjs.com/starters/AlexanderProd/gatsby-shopify-starter/), which provides many of the same features as this example.

## Setting up your Shopify account

1. Create a new [Shopify account](https://www.shopify.com) and store if you don't have one.
2. Create a private app in your store by navigating to `Apps`, then `Manage private apps`.
3. Create a new private app, with any "Private app name" and leaving the default permissions as Read access under Admin API.
4. Enable the [Shopify Storefront API](https://help.shopify.com/en/api/storefront-api) by checking the box that says "Allow this app to access your storefront data using Storefront API". Make sure to also grant access to read product and customer tags by checking their corresponding boxes.

## Set up the Gatsby Shopify plugin

1. If you do not already have one ready, [create a Gatsby site](/docs/quick-start).

2. Install the [`gatsby-source-shopify`](/plugins/gatsby-source-shopify/) plugin and [`shopify-buy`](https://github.com/Shopify/js-buy-sdk) package.

```shell
npm install gatsby-source-shopify shopify-buy
```

3. Enable and configure the plugin in your `gatsby-config.js` file, replacing [some-shop] with your shop name and [token] with your Storefront access token.

```javascript:title=/gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-shopify`,
    options: {
      // The domain name of your Shopify shop.
      shopName: `[some-shop]`,

      // The storefront access token
      accessToken: `[token]`,
    },
  },
]
```

4. Run `gatsby develop` and make sure the site compiles successfully.

## Querying Shopify data and listing products

Open the Gatsby GraphiQL interface by visiting `http://localhost:8000/___graphql`. With at least one example product added into Shopify you should see several new types of nodes in the Explorer tab, like `allShopifyProduct`. To query all products in your store sorted by title, try running the query:

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

To add a simple page listing all products, add a new file at `/src/pages/products.js`.

```jsx:title=/src/pages/products.js
import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"

const ProductsPage = ({ data }) => (
  <Layout>
    <h1>Products</h1>
    <ul>
      {data.allShopifyProduct.edges.map(({ node }) => (
        <li key={node.shopifyId}>
          <h3>
            <Link to={`/products/${node.handle}`}>{node.title}</Link>
            {" - "}${node.priceRange.minVariantPrice.amount}
          </h3>
          <p>{node.description}</p>
        </li>
      ))}
    </ul>
  </Layout>
)

export default ProductsPage

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

You can [programmatically create pages](/docs/tutorial/part-seven/) in Gatsby for every product in your Shopify store.

Create a template for your product pages by adding a new file, `/src/templates/product.js`.

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
  // The product "handle" is generated automatically by Shopify
  result.data.allShopifyProduct.edges.forEach(({ node }) => {
    createPage({
      path: `/products/${node.handle}`,
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
- [Gatsby Shopify Hello World](/starters/ohduran/gatsby-starter-hello-world-shopify/)
