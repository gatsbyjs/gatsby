# gatsby-source-filesystem

Plugin for finding source nodes on the file system. The various Gatsby
"parse" plugins parse files found by this plugin into various types of
child nodes.

## Install

`npm install --save gatsby-source-filesystem`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  // You can have multiple instances of this plugin
  // to read source nodes from different locations on your
  // filesystem.
  //
  // The following sets up the Jekyll pattern of having a
  // "pages" directory for Markdown files and a "data" directory
  // for `.json`, `.yaml`, `.csv`.
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `docs`,
      path: `${__dirname}/pages/`,
    },
  },
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `packages`,
      path: `${__dirname}/data/`,
    },
  },
]
```

## How to query

You can query file nodes like the following:

```graphql
{
  allFile {
    edges {
      node {
        extension
        dirname
        modifyDate
      }
    }
  }
}
```
