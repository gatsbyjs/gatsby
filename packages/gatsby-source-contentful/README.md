# gatsby-source-contentful

Source plugin for pulling content types, entries, and assets into Gatsby from Contentful spaces. It creates links between entry types and asset so they can be queried in Gatsby using GraphQL.

An example site for using this plugin is at
https://gatsby-using-contentful.netlify.com/

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
      accessToken: `your_acces_token`,
    },
  },
]
```
### Using Preview API

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-contentful`,
    options: {
      spaceId: `your_space_id`,
      accessToken: `your_acces_token`,
      host: `preview.contentful.com`,
    },
  },
]
```

## How to query

Two standard data types will be available from Contentful: `ContentType` and `Asset`.

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

Non-standard data types, i.e. entry types you define in Contentful, will also
be available in Gatsby. They'll be created in your site's GraphQL schema under
`contentful${entryTypeName}` and `allContentful${entryTypeName}`. For example,
if you have `Product` as one of your content types, you will be able to query
it like the following:

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
