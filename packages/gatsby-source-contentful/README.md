# gatsby-source-contentful

Source plugin for pulling data into Gatsby from Contentful spaces.

Pulls data from Contentful spaces with the [Contentful API](https://www.contentful.com/developers/docs/).

An example site for using this plugin is at
https://gatsby-using-contentful.netlify.com/

## Status

This module is at prototype-level.
It pulls Contentful ContentTypes, all entry types, and Assets.

Future improvements can include:

- Using Contentful's [sync functionality](https://www.contentful.com/developers/docs/concepts/sync/) to only get and update in Gatsby the delta of its CMS changes
- Linking Contentful nodes in Gatsby e.g. when creating a Product node in Gatsby setting `{ brand___NODE: ID_OF_THE_PRODUCT }`

## Install

`npm install --save gatsby-source-contentful`

## How to use

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

## How to query

Two standard data types will be available pulled from Contentful: ContentType and Asset.

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

Non-standard data types e.g. entry types you create in Contentful will also be available as Gatsby nodes. You should find them in GraphQL schema under `contentful${entryTypeName}` and `allContentful${entryTypeName}`. For example, if you have a Product as one of your types, you may be able to query it like the following:

```graphql
allContentfulProduct {
  edges {
    node {
      id
      productName
      image {
        sys {
          id
        }
      }
    }
  }
}
```
