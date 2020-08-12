---
title: Creating a Source Plugin
---

Source plugins are essentially out of the box integrations between Gatsby and various third-party systems.

These systems can be CMSs like Contentful or WordPress, other cloud services like Lever and Strava, or your local filesystem -- literally anything that has an API. Currently, Gatsby has [over 500 source plugins](/plugins/?=gatsby-source).

Once a source plugin brings data into Gatsby's system, it can be transformed further with **transformer plugins**. For step-by-step examples of how to create source and transformer plugins, check out the Gatsby [tutorials section](/tutorial/plugin-and-theme-tutorials/).

## Overview of a source plugin

At a high-level, a source plugin:

- Ensures local data is synced with its source and is 100% accurate.
- Creates [nodes](/docs/node-interface/) with accurate media types, human-readable types, and accurate
  [contentDigests](/docs/node-interface/#contentdigest).
- Links nodes & creates relationships between them.
- Lets Gatsby know when nodes are finished sourcing so it can move on to processing them.

A source plugin is a regular npm package. It has a `package.json` file, with optional dependencies, as well as a [`gatsby-node.js`](/docs/api-files-gatsby-node) file where you implement Gatsby's [Node APIs](/docs/node-apis/). Read more about [files Gatsby looks for in a plugin](/docs/files-gatsby-looks-for-in-a-plugin/) or [creating a generic plugin](/docs/creating-a-generic-plugin).

## Implementing features for source plugins

Key features that are often built into source plugins are covered in this guide to help explain Gatsby specific helpers and APIs, independent of the source the data is coming from.

> You can see examples of all the features implemented in this guide (sourcing data, caching, live data synchronization, and remote image optimization) **in the working example repository** for [creating source plugins](https://github.com/gatsbyjs/gatsby/tree/master/examples/creating-source-plugins) which contains a local server you can run to test with an example source plugin.

### Sourcing data and creating nodes

All source plugins must fetch data and create nodes from that data. By fetching data and creating nodes at [build time](/docs/glossary#build), Gatsby can make the data available as static assets instead of having to fetch it at [runtime](/docs/glossary#runtime). This happens in the [`sourceNodes` lifecycle](/docs/node-apis/#sourceNodes) with the [`createNode` action](/docs/actions/#createNode).

This example—taken from [the `sourceNodes` API docs](/docs/node-apis/#sourceNodes)—shows how to create a single node from hardcoded data:

```javascript:title=source-plugin/gatsby-node.js
exports.sourceNodes = ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions

  // Data can come from anywhere, but for now create it manually
  const myData = {
    key: 123,
    foo: `The foo field of my node`,
    bar: `Baz`,
  }

  const nodeContent = JSON.stringify(myData)

  const nodeMeta = {
    id: createNodeId(`my-data-${myData.key}`),
    parent: null,
    children: [],
    internal: {
      type: `MyNodeType`,
      mediaType: `text/html`,
      content: nodeContent,
      contentDigest: createContentDigest(myData),
    },
  }

  const node = Object.assign({}, myData, nodeMeta)
  createNode(node)
}
```

Source plugins follow the same pattern, the only difference is that data comes from other sources. Plugins can leverage Node.js built-in functions like `http.get`, libraries like `node-fetch` or `axios`, or even fully-featured GraphQL clients to fetch data. With data being returned from a remote location, the plugin code can loop through and create nodes programmatically:

```javascript:title=source-plugin/gatsby-node.js
exports.sourceNodes = async ({ actions }) => {
  const { createNode } = actions
  // Download data from a remote API.
  const data = await fetch(REMOTE_API)

  // Process data and create nodes.using a custom processDatum function
  data.forEach(datum => createNode(processDatum(datum)))

  // You're done, return.
  return
}
```

The [`createNode`](/docs/actions/#createNode) function is a Gatsby specific action. `createNode` is used to create the nodes that Gatsby tracks and makes available for querying with GraphQL.

_Note: **Be aware of asynchronous operations!** Because fetching data is an asynchronous task, you need to make sure you `await` data coming from remote sources, return a Promise, or return the callback (the 3rd parameter available in lifecycle APIs) from `sourceNodes`. If you don't, Gatsby will continue on in the build process, before nodes are finished being created. This can result in your nodes not ending up in the generated schema at compilation time, or the process could hang while waiting for an indication that it's finished. You can read more in the [Debugging Asynchronous Lifecycle APIs guide](/docs/debugging-async-lifecycles/)._

### Caching data between runs

Some operations like fetching data from an endpoint can be performance heavy or time-intensive. In order to improve the experience of developing with your source plugin, you can leverage the Gatsby cache to store data between runs of `gatsby develop` or `gatsby build`.

You access the `cache` in Gatsby Node APIs and use the `set` and `get` functions to store and retrieve data as JSON objects.

```javascript:title=source-plugin/gatsby-node.js
exports.onPostBuild = async ({ cache }) => {
  await cache.set(`key`, `value`)
  const cachedValue = await cache.get(`key`)
  console.log(cachedValue) // logs `value`
}
```

The above snippet shows a contrived example for the `cache`, but it can be used in more sophisticated cases to reduce the time it takes to run your plugin. For example, by caching a timestamp, you can use it to fetch solely the data that has been updated since the last time data was fetched from the source:

```javascript:title=source-plugin/gatsby-node.js
exports.sourceNodes = async ({ cache }) => {
  // get the last timestamp from the cache
  const lastFetched = await cache.get(`timestamp`)

  // pull data from some remote source using cached data as an option in the request
  const data = await fetch(
    `https://remotedatasource.com/posts?lastUpdated=${lastFetched}`
  )
  // ...
}

exports.onPostBuild = async ({ cache }) => {
  // set a timestamp at the end of the build
  await cache.set(`timestamp`, Date.now())
}
```

> In addition to the cache, plugins can save metadata to the [internal Redux store](/docs/data-storage-redux/) with `setPluginStatus`.

This can reduce the time it takes repeated data fetching operations to run if you are pulling in large amounts of data for your plugin. Existing plugins like [`gatsby-source-contentful`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-contentful/src/gatsby-node.js) generate a token that is sent with each request to only return new data.

You can read more about the cache API, other types of plugins that leverage the cache, and example open source plugins that use the cache in the [build caching guide](/docs/build-caching).

### Adding relationships between nodes

Gatsby source plugins not only create nodes, they also create relationships between nodes that are exposed to GraphQL queries.

There are two types of node relationships in Gatsby: (1) foreign-key based and (2) transformations (parent-child).

#### Option 1: foreign-key relationships

An example of a foreign-key relationship would be a `Post` type (like a blog post) that has an `Author`.

In this relationship, each object is a distinct entity that exists whether or not the other does. They could each be queried individually.

```graphql
post {
  id
  title
}
author {
  id
  name
}
```

Each type has independent schemas and field(s) on that reference the other entity -- in this case the `Post` would have an `Author`, and the `Author` might have `Post`s. The API of a service that allows complex object modelling, for example a CMS, will often allow users to add relationships between entities and expose them through the API. This same relationship can be represented by your schema.

```graphql
post {
 id
 title
 // highlight-start
 author {
   id
   name
 }
 // highlight-end
}
author {
 id
 name
 // highlight-start
 posts {
   id
   title
 }
 // highlight-end
}
```

When an object node is deleted, Gatsby _does not_ delete any referenced entities. When using foreign-key references, it's a source plugin's responsibility to clean up any dangling entity references.

##### Creating the relationship

Suppose you want to create a relationship between `Post`s and `Author`s in order to query the `author` field on a post:

```graphql
query {
  post {
    id
    // highlight-start
    author {
      id
      name
    }
    // highlight-end
  }
}
```

For Gatsby to automatically infer a relationship, you need to create a field called `author___NODE` on the Post object to hold the relationship to Authors before you create the node. The value of this field should be the node ID of the Author.

```javascript:title=source-plugin/gatsby-node.js
exports.sourceNodes = ({ actions, createContentDigest }) => {
  const { createNode } = actions
  createNode({
    // Data for the Post node
    author___NODE: `<the-authors-gatsby-node-id>`, // highlight-line
    // Required fields
    id: `a-node-id`,
    parent: null
    children: [],
    internal: {
      type: `post`,
      contentDigest: createContentDigest(fieldData),
    }
  })
}
```

For a stricter GraphQL schema, you can specify the exact field and value to link nodes using schema customization APIs.

```javascript:title=source-plugin/gatsby-node.js
exports.sourceNodes = ({ actions, createContentDigest }) => {
  const { createNode } = actions
  createNode({
    // Data for the Post node
    // highlight-start
    author: {
      name: `Jay Gatsby`,
    },
    // highlight-end
    // Required fields
    id: `a-node-id`,
    parent: null
    children: [],
    internal: {
      type: `post`,
      contentDigest: createContentDigest(fieldData),
    }
  })
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
    type Post implements Node {
      id: ID!
      # create a relationship between Post and the File nodes for optimized images
      author: Author @link(from: "author.name" by: "name") // highlight-line
      # ... other fields
    }`)
}
```

##### Creating the reverse relationship

It's often convenient for querying to add to the schema backwards references. For example, you might want to query the author of a post, but you might also want to query all the posts an author has written.

If you want to call a field to access the author on the `Post` nodes using the inference method, you would create a field called `posts___NODE` to hold the relationship to posts. The value of this field should be an array of `Post` IDs.

Here's an example from the [WordPress source plugin](https://github.com/gatsbyjs/gatsby/blob/1fb19f9ad16618acdac7eda33d295d8ceba7f393/packages/gatsby-source-wordpress/src/normalize.js#L178-L189).

With schema customization, you would add the `@link` directive to your Author type. The `@link` directive will look for an ID on the `post` field of the Author nodes, which can be added when the Author nodes are created.

```javascript:title=source-plugin/gatsby-node.js
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
    type Post implements Node {
      id: ID!
      # create a relationship between Post and the File nodes for optimized images
      author: Author @link(from: "author.name" by: "name") // highlight-line
      # ... other fields
    }
    
    type Author implements Node {
      name: String!
      post: Post @link // highlight-line
    }`)
}
```

You can read more about connecting foreign key fields with schema customization in the guide on [customizing the GraphQL schema](/docs/schema-customization/#foreign-key-fields).

#### Option 2: transformation relationships

When a node is _completely_ derived from another node you'll want to use a transformation relationship. An example that is common in source plugins is for transforming File nodes from remote sources, e.g. images. You can read about this use case in the section below on [sourcing images from remote locations](/docs/creating-a-source-plugin/#sourcing-images-from-remote-locations).

You can find more information about transformation relationships in the [creating a transformer plugin guide](/docs/creating-a-transformer-plugin/#creating-the-transformer-relationship).

#### Union types

For either type of relationship you can link a field to an array of nodes. If the array of IDs all correspond to nodes of the same type, the relationship field that is created will be of this type. If the linked nodes are of different types the field will turn into a union type of all types that are linked. See the [GraphQL documentation on how to query union types](https://graphql.org/learn/schema/#union-types).

### Working with data received from remote sources

#### Setting media and MIME types

Each node created by the filesystem source plugin includes the raw content of the file and its _media type_.

[A **media type**](https://en.wikipedia.org/wiki/Media_type) (also **MIME type** and **content type**) is an official way to identify the format of files/content that are transmitted via the internet, e.g. over HTTP or through email. You might be familiar with other media types such as `application/javascript`, `audio/mpeg`, `text/html`, etc.

Each source plugin is responsible for setting the media type for the nodes it creates. This way, source and transformer plugins can work together easily.

This is not a required field -- if it's not provided, Gatsby will [infer](/docs/glossary#inference) the type from data that is sent -- but it's how source plugins indicate to transformers that there is "raw" data the transformer can further process.

It also allows plugins to remain small and focused. Source plugins don't have to have opinions on how to transform their data: they can set the `mediaType` and push that responsibility to transformer plugins instead.

For example, it's common for services to allow you to add content in Markdown format. If you pull that Markdown into Gatsby and create a new node, what then? How would a user of your source plugin convert that Markdown into HTML they can use in their site? You would create a node for the Markdown content and set its `mediaType` as `text/markdown` and the various Gatsby Markdown transformer plugins would see your node and transform it into HTML.

This loose coupling between the data source and the transformer plugins allow Gatsby site builders to assemble complex data transformation pipelines with little work on their (and your (the source plugin author)) part.

#### Sourcing and optimizing images from remote locations

A common use case for source plugins is pulling images from a remote location and optimizing them for use with [Gatsby Image](/packages/gatsby-image/). An API may return a URL for an image on a CDN, which could be further optimized by Gatsby at build time.

This can be achieved by the following steps:

1. Install `gatsby-source-filesystem` as a dependency in your source plugin:

```shell
npm install gatsby-source-filesystem
```

2. Create File nodes using the `createRemoteFileNode` function exported by `gatsby-source-filesystem`:

```javascript:title=source-plugin/gatsby-node.js
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

exports.onCreateNode = async ({
  actions: { createNode },
  getCache,
  createNodeId,
  node,
}) => {
  // because onCreateNode is called for all nodes, verify that you are only running this code on nodes created by your plugin
  if (node.internal.type === `your-source-node-type`) {
    // create a FileNode in Gatsby that gatsby-transformer-sharp will create optimized images for
    const fileNode = await createRemoteFileNode({
      // the url of the remote image to generate a node for
      url: node.imgUrl,
      getCache,
      createNode,
      createNodeId,
      parentNodeId: node.id,
    })
  }
}
```

3. Add the ID of the new File node to your source plugin's node.

```javascript:title=source-plugin/gatsby-node.js
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

exports.onCreateNode = async ({
  actions: { createNode },
  getCache,
  createNodeId,
  node,
}) => {
  // because onCreateNode is called for all nodes, verify that you are only running this code on nodes created by your plugin
  if (node.internal.type === `your-source-node-type`) {
    // create a FileNode in Gatsby that gatsby-transformer-sharp will create optimized images for
    const fileNode = await createRemoteFileNode({
      // the url of the remote image to generate a node for
      url: node.imgUrl,
      getCache,
      createNode,
      createNodeId,
      parentNodeId: node.id,
    })

    // highlight-start
    if (fileNode) {
      // with schemaCustomization: add a field `remoteImage` to your source plugin's node from the File node
      node.remoteImage = fileNode.id

      // OR with inference: link your source plugin's node to the File node without schemaCustomization like this, but creates a less sturdy schema
      node.remoteImage___NODE = fileNode.id
    }
    // highlight-end
  }
}
```

Attaching `fileNode.id` to `remoteImage___NODE` will rely on Gatsby's [inference](/docs/glossary/#inference) of the GraphQL schema to create a new field `remoteImage` as a relationship between the nodes. This is done automatically. For a sturdier schema, you can relate them using [`schemaCustomization` APIs](/docs/node-apis/#createSchemaCustomization) by adding the `fileNode.id` to a field that you reference when you `createTypes`:

```javascript:title=source-plugin/gatsby-node.js
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
    type YourSourceType implements Node {
      id: ID!
      # create a relationship between YourSourceType and the File nodes for optimized images
      remoteImage: File @link // highlight-line
    }`)
}
```

4. Verify that `gatsby-plugin-sharp` and `gatsby-transformer-sharp` are included in the site that is using the plugin:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    // loads the source-plugin
    `your-source-plugin`,
    // required to generate optimized images
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
  ],
}
```

Then, the sharp plugins will automatically transform the File nodes created by `createRemoteFileNode` in `your-source-plugin` (which have supported image extensions like `.jpg` or `.png`). You can then query for the `remoteImage` field on your source type:

```graphql
query {
  yourSourceType {
    id
    remoteImage {
      childImageSharp {
        # fluid or fixed fields for optimzed images
      }
    }
  }
}
```

### Improve plugin developer experience by enabling faster sync

One challenge when developing locally is that a developer might make modifications in a remote data source, like a CMS, and then want to see how it looks in the local environment. Typically they will have to restart the `gatsby develop` server to see changes. In order to improve the development experience of using a plugin, you can reduce the time it takes to sync between Gatsby and the data source by enabling faster synchronization of data changes. There are two approaches for doing this:

- **Proactively fetch updates**. You can avoid having to restart the `gatsby develop` server by proactively fetching updates from the remote server. For example, [gatsby-source-sanity](https://github.com/sanity-io/gatsby-source-sanity) listens to changes to Sanity content when `watchMode` is enabled and pulls them into the Gatsby develop server. The [example source plugin repository](https://github.com/gatsbyjs/gatsby/tree/master/examples/creating-source-plugins) uses GraphQL subscriptions to listen for changes and update data.
- **Add event-based sync**. Some data sources keep event logs and are able to return a list of objects modified since a given time. If you're building a source plugin, you can store the last time you fetched data using the [cache](/docs/creating-a-source-plugin/#caching-data-between-runs) or [`setPluginStatus`](/docs/actions/#setPluginStatus) and then only sync down nodes that have been modified since that time. [gatsby-source-contentful](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-contentful) is an example of a source plugin that does this.

If possible, the proactive listener approach creates the best experience if existing APIs in the data source can support it (or you have access to build support into the data source).

Here's some pseudo code that shows this behavior:

```javascript:title=source-plugin/gatsby-node.js
exports.sourceNodes = async ({ actions, getNodesByType }, pluginOptions) => {
  const { createNode, touchNode, deleteNode } = actions

  // highlight-start
  // touch nodes to ensure they aren't garbage collected
  getNodesByType(`YourSourceType`).forEach(node => touchNode({ nodeId: node.id }))

  // ensure a plugin is in a preview mode and/or supports listening
  if (pluginOptions.preview) {
    const subscription = await subscription(SUBSCRIPTION_TO_WEBSOCKET)
    subscription.subscribe(({ data: newData }) => {
      newData.forEach(newDatum => {
        switch (newDatum.status) {
          case "deleted":
            deleteNode({
              node: getNode(createNodeId(`YourSourceType-${newDatum.uuid}`)),
            })
            break
          case "created":
          case "updated":
          default:
            // created and updated can be handled by the same code path
            // the post's id is presumed to stay constant (or can be inferred)
            createNode(processDatum(newDatum))
            break
        )
      }
    })
  }
  // highlight-end

  const data = await client.query(QUERY_TO_API)

  // Process data and create nodes.using a custom processDatum function
  data.forEach(datum => createNode(processDatum(datum)))

  // You're done, return.
  return
}
```

_Note: This is pseudo code to illustrate the logic and concept of how these plugins function, you can see an example in the [creating source plugins](https://github.com/gatsbyjs/gatsby/tree/master/examples/creating-source-plugins) repository._

Because the code in `sourceNodes` is reinvoked when changes in the data source occur, a few steps need to be taken to ensure that Gatsby is tracking the existing nodes as well as the new data. A first step is ensuring that the existing nodes created are not garbage collected which is done by "touching" the nodes with the [`touchNode` action](/docs/actions/#touchNode).

Then the new data needs to be pulled in via a live update like a websocket (in the example above with a subscription). The new data needs to have some information attached that dictates whether the data was created, updated, or deleted; that way, when it is processed, a new node can be created/updated (with `createNode`) or deleted (with `deleteNode`). In the example above that information is coming from `newDatum.status`.

## Additional resources

- Working example repository on [creating source plugins](https://github.com/gatsbyjs/gatsby/tree/master/examples/creating-source-plugins) with the features in this guide implemented
- Tutorial on [Creating a Source Plugin](/tutorial/source-plugin-tutorial/)
- [`gatsby-node-helpers`](https://github.com/angeloashmore/gatsby-node-helpers), a community-made npm package with helper functions to generate Node objects with required fields like IDs and the `contentDigest` MD5 hash.
