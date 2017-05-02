# gatsby-source-drupal

Source plugin for pulling data into Gatsby from Drupal sites.

Pulls data from Drupal sites with the [Drupal's JSONAPI
module](https://www.drupal.org/project/jsonapi) installed.

An example site for using this plugin is at
https://using-drupal.gatsbyjs.org/

## Status

This module is at prototype-level. It currently only pulls from Drupal article
nodes and users. TODOs include making it work with all node types.

## Install

`npm install --save gatsby-source-drupal`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-drupal`,
    options: {
      baseUrl: `http://dev-gatsbyjs-d8.pantheonsite.io`,
    },
  },
]
```

## How to query

You can query nodes created from Drupal like the following:

```graphql
{
  allDrupalNodeArticle {
    edges {
      node {
        title
        nid
        created(formatString: "DD-MMM-YYYY")
        author {
          name
        }
      }
    }
  }
}
```


