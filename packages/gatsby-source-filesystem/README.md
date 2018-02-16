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

## Helper functions

`gatsby-source-filesystem` exports two helper functions:

* `createFilePath`
* `createRemoteFileNode`

### createFilePath

When building pages from files, you often want to create a URL from a file's path on the file system. E.g. if you have a markdown file at `src/content/2018-01-23-an-exploration-of-the-nature-of-reality/index.md`, you might want to turn that into a page on your site at `example.com/2018-01-23-an-exploration-of-the-nature-of-reality/`. `createFilePath` is a helper function to make this task easier.

```javascript
createFilePath({
  // The node you'd like to convert to a path
  // e.g. froom a markdown, JSON, YAML file, etc
  node:
  // Method used to get a node
  // The parameter from `onCreateNode` should be passed in here
  getNode:
  // The base path for your files.
  // Defaults to `src/pages`. For the example above, you'd use `src/contents`.
  basePath:
  // Whether you want your file paths to contain a trailing `/` slash
  // Defaults to true
  trailingSlash:
})
```

#### Example usage

The following is taken from [Gatsby Tutorial, Part Four](https://www.gatsbyjs.org/tutorial/part-four/#programmatically-creating-pages-from-data) and is used to create URL slugs for markdown pages.

```javascript
const { createFilePath } = require(`gatsby-source-filesystem`);

exports.onCreateNode = ({ node, getNode, boundActionCreators }) => {
  const { createNodeField } = boundActionCreators;
  // Ensures we are processing only markdown files
  if (node.internal.type === "MarkdownRemark") {
    // Use `createFilePath` to turn markdown files in our `data/faqs` directory into `/faqs/slug`
    const relativeFilePath = createFilePath({
      node,
      getNode,
      basePath: "data/faqs/",
    });

    // Creates new query'able field with name of 'slug'
    createNodeField({
      node,
      name: "slug",
      value: `/faqs${relativeFilePath}`,
    });
  }
};
```

### createRemoteFileNode

```javascript
TO DO
```
