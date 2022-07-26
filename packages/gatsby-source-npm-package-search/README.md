# gatsby-source-npm-package-search

This plugin uses Yarn's Algolia search to import all gatsby-related package info (any package with the gatsby-component or gatsby-plugin keyword). Check back for updates to search for other npm packages based on keyword.

## Install

`npm install gatsby-source-npm`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-npm-package-search`,
    options: {
      keywords: [`keyword1`, `keyword2`],
    },
  },
]
```

## How to query

You can query npm nodes like the following

```graphql
{
  allNpmPackages {
    edges {
      node {
        name
        humanDownloadsLast30Days
        readme {
          childMarkdownRemark {
            html
          }
        }
      }
    }
  }
}
```
