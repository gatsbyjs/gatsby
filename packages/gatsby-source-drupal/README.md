# gatsby-source-drupal

Source plugin for pulling data (including images) into Gatsby from Drupal sites.

Pulls data from Drupal 8 sites with the
[Drupal JSONAPI module](https://www.drupal.org/project/jsonapi) installed.

An example site built with the headless Drupal distro
[ContentaCMS](https://twitter.com/contentacms) is at
https://using-drupal.gatsbyjs.org/

`apiBase` Option allows changing the API entry point depending on the version of
jsonapi used by your Drupal instance. The default value is `jsonapi`, which has
been used since jsonapi version `8.x-1.0-alpha4`.

## Install

`npm install --save gatsby-source-drupal`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-drupal`,
    options: {
      baseUrl: `https://live-contentacms.pantheonsite.io/`,
      apiBase: `api`, // optional, defaults to `jsonapi`
    },
  },
]
```

## How to query

You can query nodes created from Drupal like the following:

```graphql
{
  allArticle {
    edges {
      node {
        title
        internalId
        created(formatString: "DD-MMM-YYYY")
      }
    }
  }
}
```
