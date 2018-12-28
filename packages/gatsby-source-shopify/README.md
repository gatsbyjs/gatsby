# gatsby-source-shopify

Source plugin for pulling data into [Gatsby][gatsby] from [Shopify][shopify]
stores via the [Shopify Storefront API][shopify-storefront-api].

## Features

- Provides public shop data available via the [Shopify Storefront API][shopify-storefront-api]
- Supports `gatsby-transformer-sharp` and `gatsby-image` for product and
  article images

## Install

```sh
npm install --save gatsby-source-shopify
```

## How to use

```js
// In your gatsby-config.js
plugins: [
  /*
   * Gatsby's data processing layer begins with “source”
   * plugins. Here the site sources its data from Shopify.
   */
  {
    resolve: "gatsby-source-shopify",
    options: {
      // The domain name of your Shopify shop. This is required.
      // Example: 'gatsby-source-shopify-test-shop' if your Shopify address is
      // 'gatsby-source-shopify-test-shop.myshopify.com'.
      shopName: "gatsby-source-shopify-test-shop",

      // An API access token to your Shopify shop. This is required.
      // You can generate an access token in the "Manage private apps" section
      // of your shop's Apps settings. In the Storefront API section, be sure
      // to select "Allow this app to access your storefront data using the
      // Storefront API".
      // See: https://help.shopify.com/api/custom-storefronts/storefront-api/getting-started#authentication
      accessToken: "example-wou7evoh0eexuf6chooz2jai2qui9pae4tieph1sei4deiboj",

      // Set verbose to true to display a verbose output on `npm run develop`
      // or `npm run build`. This prints which nodes are being fetched and how
      // much time was required to fetch and process the data.
      // Defaults to true.
      verbose: true,
    },
  },
]
```

## How to query

You can query nodes created from Shopify using GraphQL like the following:

**Note**: Learn to use the GraphQL tool and Ctrl+Spacebar at
<http://localhost:8000/___graphql> to discover the types and properties of your
GraphQL model.

```graphql
{
  allShopifyProduct {
    edges {
      node {
        id
        title
        handle
        productType
        vendor
        variants {
          id
          title
          price
        }
      }
    }
  }
}
```

All Shopify data is pulled using the [Shopify Storefront
API][shopify-storefront-api]. Data is made available in the same structure as
provided by the API, with a few exceptions noted below.

The following data types are available:

| Name               | Description                                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **Article**        | A blog entry.                                                                                                         |
| **Blog**           | Collection of articles.                                                                                               |
| **Comment**        | A comment on a blog entry.                                                                                            |
| **Collection**     | Represents a grouping of products that a shop owner can create to organize them or make their shops easier to browse. |
| **Product**        | Represents an individual item for sale in a Shopify store.                                                            |
| **ProductOption**  | Custom product property names.                                                                                        |
| **ProductVariant** | Represents a different version of a product, such as differing sizes or differing colors.                             |
| **ProductType**    | Represents a category of products.                                                                                    |
| **ShopPolicy**     | Policy that a merchant has configured for their store, such as their refund or privacy policy.                        |

For each data type listed above, `shopify${typeName}` and
`allShopify${typeName}` is made available. Nodes that are closely related, such
as `Article` and `Comment`, are provided as node fields as described below.

**Note**: The following examples are not a complete reference to the available
fields for each node. Utilize Gatsby's built-in GraphQL tool to discover the
types and properties available.

### Query articles

The associated blog data is provided on the `blog` field. Article comments are
provided on the `comments` field.

```graphql
{
  allShopifyArticle {
    edge {
      node {
        id
        author {
          email
          name
        }
        blog {
          title
        }
        comments {
          id
          author {
            email
            name
          }
          contentHtml
        }
        contentHtml
        publishedAt(formatString: "ddd, MMMM Do, YYYY")
      }
    }
  }
}
```

### Query blogs

Blog data is provided on the `blog` field on `Article`, but it can be queried
directly like the following:

```graphql
{
  allShopifyBlog {
    edge {
      node {
        id
        title
        url
      }
    }
  }
}
```

### Query article comments

Comments are provided on the `comments` field on `Article`, but they can be
queried directly like the following:

```graphql
{
  allShopifyComment {
    edge {
      node {
        id
        author {
          email
          name
        }
        contentHtml
      }
    }
  }
}
```

### Query product collections

Products in the collection are provided on the `products` field.

```graphql
{
  allShopifyCollection {
    edge {
      node {
        id
        descriptionHtml
        handle
        image {
          src
          alt
        }
        products {
          id
          handle
          title
        }
        title
      }
    }
  }
}
```

### Query products

Product variants and options are provided on the `variants` and `options`
fields.

```graphql
{
  allShopifyProduct {
    edge {
      node {
        id
        descriptionHtml
        handle
        images {
          originalSrc
        }
        variants {
          id
          availableForSale
          image {
            originalSrc
          }
          price
          selectedOptions {
            name
            value
          }
          sku
          title
        }
        title
      }
    }
  }
}
```

### Query product options

Product options are provided on the `options` field on `Product`, but they can
be queried directly like the following:

```graphql
{
  allShopifyProductOption {
    edge {
      node {
        id
        name
        values
      }
    }
  }
}
```

### Query product variants

Product variants are provided on the `variants` field on `Product`, but they
can be queried directly like the following:

```graphql
{
  allShopifyProductVariant {
    edge {
      node {
        id
        availableForSale
        image {
          originalSrc
        }
        price
        selectedOptions {
          name
          value
        }
        sku
        title
      }
    }
  }
}
```

### Query shop policies

Shop policies include the following types:

- Privacy Policy (`privacyPolicy`)
- Refund Policy (`refundPolicy`)
- Terms of Service (`termsOfService`)

The type of policy is provided on the `type` field. Policies can be queried
like the following:

```graphql
{
  allShopifyShopPolicy {
    edge {
      node {
        body
        title
        type
      }
    }
  }
}
```

### Image processing

To use image processing you need `gatsby-transformer-sharp`,
`gatsby-plugin-sharp`, and their dependencies `gatsby-image` and
`gatsby-source-filesystem` in your `gatsby-config.js`.

You can apply image processing to any image field on a node. Image processing
of inline images added to description fields is currently not supported.

To access image processing in your queries, you need to use this pattern, where
`...ImageFragment` is one of the [`gatsby-transformer-sharp`
fragments][gatsby-image-fragments]:

```graphql
{
  allShopifyProduct {
    edges {
      node {
        id
        images {
          localFile {
            childImageSharp {
              ...ImageFragment
            }
          }
        }
      }
    }
  }
}
```

Full example:

```graphql
{
  allShopifyProduct {
    edges {
      node {
        id
        images {
          localFile {
            childImageSharp {
              resolutions(width: 500, height: 300) {
                ...GatsbyImageSharpResolutions_withWebp
              }
            }
          }
        }
      }
    }
  }
}
```

To learn more about image processing, check the documentation of
[gatsby-plugin-sharp][gatsby-plugin-sharp].

## Site's `gatsby-node.js` example

```js
const path = require("path")

exports.createPages = async ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  const pages = await graphql(`
    {
      allShopifyProduct {
        edges {
          node {
            id
            handle
          }
        }
      }
    }
  `)

  pages.data.allShopifyProduct.edges.forEach(edge => {
    createPage({
      path: `/${edge.node.handle}`,
      component: path.resolve("./src/templates/product.js"),
      context: {
        id: edge.node.id,
      },
    })
  })
}
```

## A note on customer information

Not all Shopify nodes have been implemented as they are not necessary for the
static portion of a Gatsby-generated website. This includes any node that
contains sensitive customer-specific information, such as `Order` and
`Payment`.

If you are in need of this data (e.g. building a private, internal website),
please open an issue. Until then, the nodes will not be implemented to lessen
the chances of someone accidentally making private information publicly
available.

[gatsby]: https://www.gatsbyjs.org/
[shopify]: https://www.shopify.com/
[shopify-storefront-api]: https://help.shopify.com/api/custom-storefronts/storefront-api
[graphql-inline-fragments]: http://graphql.org/learn/queries/#inline-fragments
[gatsby-plugin-sharp]: https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-plugin-sharp
[gatsby-image-fragments]: https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-image#gatsby-transformer-sharp
