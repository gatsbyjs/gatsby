# gatsby-source-strapi

Source plugin for pulling documents into Gatsby from a Strapi API.

## Install

`npm install --save gatsby-source-strapi`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-strapi`,
    options: {
      apiURL: `http://localhost:1337`,
      contentTypes: [`article`, `user`],
    },
  },
];
```

## How to query

You can query Document nodes created from your Strapi API like the following:

```graphql
{
  allStrapiArticle {
    edges {
      node {
        id
        title
        content
      }
    }
  }
}
```

## Examples

Tutorials:

 - https://hackernoon.com/building-a-static-blog-using-gatsby-and-strapi-8b5acfc82ad8
