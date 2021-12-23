# gatsby-source-filesystem

A Gatsby source plugin for sourcing data into your Gatsby application
from your local filesystem.

The plugin creates `File` nodes from files. The various "transformer"
plugins can transform `File` nodes into various other types of data e.g.
`gatsby-transformer-json` transforms JSON files into JSON data nodes and
`gatsby-transformer-remark` transforms markdown files into `MarkdownRemark`
nodes from which you can query an HTML representation of the markdown.

## Install

`npm install gatsby-source-filesystem`

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
        ignore: [`**/\.*`], // ignore files starting with a dot
      },
    },
  ],
}
```

## Options

In addition to the name and path parameters you may pass an optional `ignore` array of file globs to ignore.

They will be added to the following default list:

```text
**/*.un~
**/.DS_Store
**/.gitignore
**/.npmignore
**/.babelrc
**/yarn.lock
**/node_modules
../**/dist/**
```

To prevent concurrent requests overload of `processRemoteNode`, you can adjust the `200` default concurrent downloads, with `GATSBY_CONCURRENT_DOWNLOAD` environment variable.

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

To filter by the `name` you specified in the config, use `sourceInstanceName`:

```graphql
{
  allFile(filter: { sourceInstanceName: { eq: "data" } }) {
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

`gatsby-source-filesystem` exports three helper functions:

- `createFilePath`
- `createRemoteFileNode`
- `createFileNodeFromBuffer`

### createFilePath

When building pages from files, you often want to create a URL from a file's path on the file system. E.g. if you have a markdown file at `src/content/2018-01-23-an-exploration-of-the-nature-of-reality/index.md`, you might want to turn that into a page on your site at `example.com/2018-01-23-an-exploration-of-the-nature-of-reality/`. `createFilePath` is a helper function to make this task easier.

```javascript
createFilePath({
  // The node you'd like to convert to a path
  // e.g. from a markdown, JSON, YAML file, etc
  node,
  // Method used to get a node
  // The parameter from `onCreateNode` should be passed in here
  getNode,
  // The base path for your files.
  // It is relative to the `options.path` setting in the `gatsby-source-filesystem` entries of your `gatsby-config.js`.
  // Defaults to `src/pages`. For the example above, you'd use `src/content`.
  basePath,
  // Whether you want your file paths to contain a trailing `/` slash
  // Defaults to true
  trailingSlash,
})
```

#### Example usage

The following is taken from [Gatsby Tutorial, Part Seven](https://www.gatsbyjs.org/tutorial/part-7/) and is used to create URL slugs for markdown pages.

```javascript
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions
  // Ensures we are processing only markdown files
  if (node.internal.type === "MarkdownRemark") {
    // Use `createFilePath` to turn markdown files in our `data/faqs` directory into `/faqs/slug`
    const relativeFilePath = createFilePath({
      node,
      getNode,
      basePath: "data/faqs/",
    })

    // Creates new query'able field with name of 'slug'
    createNodeField({
      node,
      name: "slug",
      value: `/faqs${relativeFilePath}`,
    })
  }
}
```

### createRemoteFileNode

When building source plugins for remote data sources such as headless CMSs, their data will often link to files stored remotely that are often convenient to download so you can work with them locally.

The `createRemoteFileNode` helper makes it easy to download remote files and add them to your site's GraphQL schema.

While downloading the assets, special characters (regex: `/:|\/|\*|\?|"|<|>|\||\\/g`) in filenames are replaced with a hyphen "-". When special characters are found a file hash is added to keep files unique e.g `a:file.jpg` becomes `a-file-73hd.jpg` (as otherwise `a:file.jpg` and `a*file.jpg` would overwrite themselves).

**Warning**: Please make sure to pass in the `parentNodeId`. Otherwise if the parent of the created file node is loaded from the cache, the linked file node won't be recreated which means it will be garbage collected and your file is set to null.

```javascript
createRemoteFileNode({
  // The source url of the remote file
  url: `https://example.com/a-file.jpg`,

  // The id of the parent node (i.e. the node to which the new remote File node will be linked to.
  parentNodeId,

  // Gatsby's cache which the helper uses to check if the file has been downloaded already. It's passed to all Node APIs.
  getCache,

  // The action used to create nodes
  createNode,

  // A helper function for creating node Ids
  createNodeId,

  // OPTIONAL
  // Adds htaccess authentication to the download request if passed in.
  auth: { htaccess_user: `USER`, htaccess_pass: `PASSWORD` },

  // OPTIONAL
  // Adds extra http headers to download request if passed in.
  httpHeaders: { Authorization: `Bearer someAccessToken` },

  // OPTIONAL
  // Sets the file extension
  ext: ".jpg",
})
```

#### Example usage

The following example is pulled from [gatsby-source-wordpress](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-wordpress). Downloaded files are created as `File` nodes and then linked to the WordPress Media node, so it can be queried both as a regular `File` node and from the `localFile` field in the Media node.

```javascript
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

exports.downloadMediaFiles = ({
  nodes,
  getCache,
  createNode,
  createNodeId,
  _auth,
}) => {
  nodes.map(async node => {
    let fileNode
    // Ensures we are only processing Media Files
    // `wordpress__wp_media` is the media file type name for WordPress
    if (node.__type === `wordpress__wp_media`) {
      try {
        fileNode = await createRemoteFileNode({
          url: node.source_url,
          parentNodeId: node.id,
          getCache,
          createNode,
          createNodeId,
          auth: _auth,
        })
      } catch (e) {
        // Ignore
      }
    }

    // Adds a field `localFile` to the node
    // ___NODE appendix tells Gatsby that this field will link to another node
    if (fileNode) {
      node.localFile___NODE = fileNode.id
    }
  })
}
```

The file node can then be queried using GraphQL. See an example of this in the [gatsby-source-wordpress README](/plugins/gatsby-source-wordpress/#image-processing) where downloaded images are queried using [gatsby-transformer-sharp](/plugins/gatsby-transformer-sharp/) to use in the component [gatsby-image](/plugins/gatsby-image/).

#### Retrieving the remote file name and extension

The helper tries first to retrieve the file name and extension by parsing the url and the path provided (e.g. if the url is `https://example.com/image.jpg`, the extension will be inferred as `.jpg` and the name as `image`). If the url does not contain an extension, we use the [`file-type`](https://www.npmjs.com/package/file-type) package to infer the file type. Finally, the name and the extension _can_ be explicitly passed, like so:

```javascript
createRemoteFileNode({
  // The source url of the remote file
  url: `https://example.com/a-file-without-an-extension`,
  parentNodeId: node.id,
  getCache,
  createNode,
  createNodeId,
  // if necessary!
  ext: ".jpg",
  name: "image",
})
```

### createFileNodeFromBuffer

When working with data that isn't already stored in a file, such as when querying binary/blob fields from a database, it's helpful to cache that data to the filesystem in order to use it with other transformers that accept files as input.

The `createFileNodeFromBuffer` helper accepts a `Buffer`, caches its contents to disk, and creates a file node that points to it.

**Warning**: Please make sure to pass in the `parentNodeId`. Otherwise if the parent of the created file node is loaded from the cache, the linked file node won't be recreated which means it will be garbage collected and your file is set to null.

#### Example usage

The following example is a common case where you want to create a sharing image dynamically, instead of loading an existing image.

```js
// gatsby-node.js
exports.onCreateNode = async ({ node, actions, getCache, createNodeId }) => {
  const { createNode, createNodeField } = actions
  /**
   * For every incoming Markdown node we want to generate a social card
   * and attach it to the the node.
   */
  if (node.internal.type === "MarkdownRemark") {
    const title = node.frontmatter.title
    // we need the title in order to generate anything
    if (!title) {
      return
    }

    // this some function that generates your image as a buffer
    // use `node-canvas` (https://www.npmjs.com/package/canvas) or similar.
    const imageBuffer = await generateSomeImage(title)

    const fileNode = await createFileNodeFromBuffer({
      name: "social-card",
      buffer: imageBuffer,
      getCache,
      createNode,
      createNodeId,
      // make sure to always pass in the parent node otherwise it's lost when loaded from cache
      parentNodeId: node.id,
    })

    if (fileNode) {
      createNodeField({
        node,
        name: `socialCard`,
        value: fileNode.id,
      })
    }
  }
}

exports.createSchemaCustomization = ({ actions: { createTypes } }) => {
  const typeDefs = [
    `type MarkdownRemark implements Node { 
      socialCardFile: File @link(from: "fields.socialCard")
    }`,
  ]

  createTypes(typeDefs)
}
```

## Troubleshooting

### File nodes are null after starting the server a second time

In case you see yourself running `gatsby clean` frequently to files that are set to `null` you might might have forgotten to pass in `parentNodeId` to `createFileNodeFromBuffer` or `createRemoteFileNode`. Make sure you always provide a parent reference otherwise the files won't be recreated which means it will be garbage collected and show up as `null` in your queried data.

### Spotty network

In case that due to spotty network, or slow connection, some remote files fail to download. Even after multiple retries and adjusting concurrent downloads, you can adjust timeout and retry settings with these environment variables:

- `GATSBY_STALL_RETRY_LIMIT`, default: `3`
- `GATSBY_STALL_TIMEOUT`, default: `30000`
- `GATSBY_CONNECTION_TIMEOUT`, default: `30000`
