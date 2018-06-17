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

- `createFilePath`
- `createRemoteFileNode`

### createFilePath

When building pages from files, you often want to create a URL from a file's path on the file system. E.g. if you have a markdown file at `src/content/2018-01-23-an-exploration-of-the-nature-of-reality/index.md`, you might want to turn that into a page on your site at `example.com/2018-01-23-an-exploration-of-the-nature-of-reality/`. `createFilePath` is a helper function to make this task easier.

```javascript
createFilePath({
  // The node you'd like to convert to a path
  // e.g. from a markdown, JSON, YAML file, etc
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

The following is taken from [Gatsby Tutorial, Part Seven](https://www.gatsbyjs.org/tutorial/part-seven/) and is used to create URL slugs for markdown pages.

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

When building source plugins for remote data sources such as headless CMSs, their data will often link to files stored remotely that are often convenient to download so you can work with them locally.

The `createRemoteFileNode` helper makes it easy to download remote files and add them to your site's GraphQL schema.

```javascript
createRemoteFileNode({
  // The source url of the remote file
  url: `https://example.com/a-file.jpg`,

  // The redux store which is passed to all Node APIs.
  store,

  // Gatsby's cache which the helper uses to check if the file has been downloaded already. It's passed to all Node APIs.
  cache,

  // The boundActionCreator used to create nodes
  createNode,

  // OPTIONAL
  // Adds htaccess authentication to the download request if passed in.
  auth: { htaccess_user: `USER`, htaccess_pass: `PASSWORD` },
});
```

#### Example usage

The following example is pulled from [gatsby-source-wordpress](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-wordpress). Downloaded files are created as `File` nodes and then linked to the WordPress Media node, so it can be queried both as a regular `File` node and from the `localFile` field in the Media node.

```javascript
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);

exports.downloadMediaFiles = ({ nodes, store, cache, createNode, _auth }) => {
  nodes.map(async node => {
    let fileNode;
    // Ensures we are only processing Media Files
    // `wordpress__wp_media` is the media file type name for Wordpress
    if (node.__type === `wordpress__wp_media`) {
      try {
        fileNode = await createRemoteFileNode({
          url: node.source_url,
          store,
          cache,
          createNode,
          auth: _auth,
        });
      } catch (e) {
        // Ignore
      }
    }

    // Adds a field `localFile` to the node
    // ___NODE appendix tells Gatsby that this field will link to another node
    if (fileNode) {
      node.localFile___NODE = fileNode.id;
    }
  });
};
```

The file node can then be queried using GraphQL. See an example of this in the [gatsby-source-wordpress README](/packages/gatsby-source-wordpress/#image-processing) where downloaded images are queried using [gatsby-transformer-sharp](/packages/gatsby-transformer-sharp/) to use in the component [gatsby-image](/packages/gatsby-image/).
