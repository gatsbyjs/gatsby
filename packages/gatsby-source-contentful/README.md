# gatsby-source-contentful

Source plugin for pulling content types, entries, and assets into Gatsby from
Contentful spaces. It creates links between entry types and asset so they can be
queried in Gatsby using GraphQL.

An example site for using this plugin is at
https://using-contentful.gatsbyjs.org/

## Install

`npm install --save gatsby-source-contentful`

## How to use

### Using Delivery API

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-contentful`,
    options: {
      spaceId: `your_space_id`,
      accessToken: `your_access_token`,
    },
  },
];
```

### Using Preview API

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-contentful`,
    options: {
      spaceId: `your_space_id`,
      accessToken: `your_access_token`,
      host: `preview.contentful.com`,
    },
  },
];
```

## Notes on Contentful Content Models

There are currently some things to keep in mind when building your content models at contentful.

1. At the moment, Fields that do not have at least 1 populated instance will not be created in the graphql schema.

2. When using reference fields, be aware that this source plugin will automatically create the reverse reference. You do not need to create references on both content types. For simplicity, it is easier to put the reference field on the child in child/parent relationships.

## How to query

Two standard data types will be available from Contentful: `ContentType` and
`Asset`.

You can query Asset nodes created from Contentful like the following:

```graphql
{
  allContentfulAsset {
    edges {
      node {
        id
        file {
          url
        }
      }
    }
  }
}
```

Non-standard data types, i.e. entry types you define in Contentful, will also be
available in Gatsby. They'll be created in your site's GraphQL schema under
`contentful${entryTypeName}` and `allContentful${entryTypeName}`. For example,
if you have `Product` as one of your content types, you will be able to query it
like the following:

```graphql
allContentfulProduct {
    edges {
      node {
        id
        productName
        image {
          responsiveResolution(width: 100) {
            width
            height
            src
            srcSet
          }
        }
      }
    }
  }
}
```
