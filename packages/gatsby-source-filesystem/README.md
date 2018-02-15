# gatsby-source-filesystem

Plugin for creating `File` nodes from the file system. The various "transformer"
plugins transform `File` nodes into various other types of data e.g.
`gatsby-transformer-json` transforms JSON files into JSON data nodes and
`gatsby-transformer-remark` transforms markdown files into `MarkdownRemark`
nodes from which you can query an HTML representation of the markdown.

## Install

`npm install --save gatsby-source-filesystem`

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
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
        path: `${__dirname}/src/pages/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/src/data/`,
      },
    },
  ],
};
```
## API

`gatsby-source-filesystem` reveals two APIs:
- `createFilePath`
- `createRemoteFileNode`

### createFilePath
```javascript
// In your gatsby-node.js
createFilePath({
  // The node you'd like to create into a filepath
  // Param from `onCreateNode` can be used here
  // ie: a markdown file, JSON data, etc
  node:
  // Method used to get a node
  // Param from `onCreateNode` can be used here
  getNode:
  // the slug structure you'd like to create
  // Defaults to `src/pages`
  basePath:
  // Whether you want your file paths to contain a trailing `/` slash
  // Defaults to true
  trailingSlash:
})
```

#### Example usage
The following is taken from [Gatsby Tutorial, Part Four](https://www.gatsbyjs.org/tutorial/part-four/#programmatically-creating-pages-from-data) and is used to create URL slugs from markdown pages.

```javascript
exports.onCreateNode = ({ node, getNode, boundActionCreators }) => {
    const { createNodeField } = boundActionCreators
    // Ensures we are processing only markdown files
    if (node.internal.type === 'MarkdownRemark') {
        // Use `createFilePath` to turn markdown files in our `data/faqs` directory into `/faqs/slug`
        const relativeFilePath = createFilePath({ node, getNode, basePath: 'data/faqs/', trailingSlash: false })

        // Creates new query'able field with name of 'slug'
        createNodeField({
            node,
            name: 'slug',
            value: `/faqs${relativeFilePath}`
        })
    }
};
```

### createRemoteFileNode

```javascript
TO DO
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
        modifiedTime
      }
    }
  }
}
```
