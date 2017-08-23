# gatsby-source-filesystem

Plugin for creating `File` nodes from the file system. The various
"transformer" plugins transform `File` nodes into various other types of data
e.g. `gatsby-transformer-json` transforms JSON files into JSON data nodes and
`gatsby-transformer-remark` transforms markdown files into `MarkdownRemark`
nodes from which you can query an HTML representation of the markdown.

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
      name: `pages`,
      path: `${__dirname}/pages/`,
    },
  },
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `data`,
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
        dir
        modifyDate
      }
    }
  }
}
```
