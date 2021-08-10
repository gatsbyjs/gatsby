---
title: Creating a Source Plugin
---

Source plugins are essentially out of the box integrations between Gatsby and various third-party systems.

These systems can be CMSs like Contentful or WordPress, other cloud services like Lever and Strava, or your local filesystem -- literally anything that has an API. Currently, Gatsby has [over 500 source plugins](/plugins/?=gatsby-source).

Once a source plugin brings data into Gatsby's system, it can be transformed further with **transformer plugins**. For step-by-step examples of how to create source and transformer plugins, check out the Gatsby [tutorials section](/tutorial/plugin-and-theme-tutorials/).

## Overview of a source plugin

At a high-level, a source plugin:

- Ensures local data is synced with its source and is 100% accurate.
- Creates [nodes](/docs/reference/graphql-data-layer/node-interface/) with accurate media types, human-readable types, and accurate
  [contentDigests](/docs/reference/graphql-data-layer/node-interface/#contentdigest).
- Links nodes & creates relationships between them.
- Lets Gatsby know when nodes are finished sourcing so it can move on to processing them.

A source plugin is a regular npm package. It has a `package.json` file, with optional dependencies, as well as a [`gatsby-node.js`](/docs/reference/config-files/gatsby-node/) file where you implement Gatsby's Node APIs. Read more about [files Gatsby looks for in a plugin](/docs/files-gatsby-looks-for-in-a-plugin/) or [creating a generic plugin](/docs/how-to/plugins-and-themes/creating-a-generic-plugin).

## Implementing features for source plugins

Key features that are often built into source plugins are covered in this guide to help explain Gatsby specific helpers and APIs, independent of the source the data is coming from.

> You can see examples of all the features implemented in this guide (sourcing data, caching, live data synchronization, and remote image optimization) **in the working example repository** for [creating source plugins](https://github.com/gatsbyjs/gatsby/tree/master/examples/creating-source-plugins) which contains a local server you can run to test with an example source plugin.

### Sourcing data and creating nodes

All source plugins must fetch data and create nodes from that data. By fetching data and creating nodes at [build time](/docs/glossary#build), Gatsby can make the data available as static assets instead of having to fetch it at [runtime](/docs/glossary#runtime). This happens in the [`sourceNodes` lifecycle](/docs/reference/config-files/gatsby-node/#sourceNodes) with the [`createNode` action](/docs/reference/config-files/actions/#createNode).

This example—taken from [the `sourceNodes` API docs](/docs/reference/config-files/gatsby-node/#sourceNodes)—shows how to create a single node from hardcoded data:

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

The [`createNode`](/docs/reference/config-files/actions/#createNode) function is a Gatsby specific action. `createNode` is used to create the nodes that Gatsby tracks and makes available for querying with GraphQL.

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

### Adding support for Gatsby Cloud Content Loader

Content Loader is a service that will allow a CMS to route from a piece of content in the CMS to a built page in the users Gatsby site where that content is rendered. Currently, the primary use-case for this is implementing Content Previews. This allows site admins to preview their content in a Gatsby Preview instance before they decide to push it to their production site.

#### How Content Loader works for users

This feature will display a loading page while the users content is being built in Gatsby Cloud. Once the build is finished, the loader will route the user to the correct page. If any errors occur, the loader will let the user know. This way site admins wont be left guessing when they can view their preview content.

#### Why use Content Loader

Using Content Loader has some advantages over having your CMS load and route to previews.

1. The loader is aware of wether or not the build has finished, allowing the user to be routed to the right page at the right time.
2. The loader has error handling to let the user know if a build failed.
3. The loader can route the user to the correct page even if the page path has been constructed in ways the CMS isn't aware of.
4. The loader will let the user know if no page was created in the Gatsby site for the content they're attempting to preview.

#### Understanding Node Manifests

A node manifest is a JSON file which contains information about how a node became a page in Gatsby core. This allows the Content Loader to route a user to a page based on that node manifests ID. For example here's a node manifest with an ID of `Post-id-1-modified-1628618395702`:

```json
{
  "node": { "id": "Page-1" },
  "page": { "path": "/my-page-path/" },
  "foundPageBy": "ownerNodeId"
}
```

Content Loader will wait for this file to exist, read it, and then redirect the user to `/my-page-path/`.

There are a few ways Gatsby can find the relationship between a node that was created and a page that was built using that node. The most important way to know about is via the [`ownerNodeId` property users can set when calling the `createPage` action](https://www.gatsbyjs.com/docs/reference/config-files/actions/#createPage). This allows a Gatsby site developer to tell Gatsby which node "owns" a page, allowing Gatsby to more effectively route to that page in the Content Loader. If users do not set an `ownerNodeId`, Gatsby will automatically try to guess which page a node can be viewed on. This is done by looking at query tracking in Gatsby as well as `pageContext` to look for an `id` property.

#### Understanding and constructing node manifest ID's

A node manifest ID is an ID which is unique within the scope of your CMS (not necessarily unique within Gatsby). This ID ties the revision state of a specific piece of content to a point in time.
For example, the node manifest ID could be a combination of The content type of that node, the node's ID, and the last time that content was modified by a CMS user (`Post-id-1-modified-1628618395702`).
This node manifest ID will be used inside of your source plugin as well as inside of the Content Loader. In your source plugin it will connect the node being previewed to a page that was built from it (more on that below).
In the Content Loader UI the same node manifest ID will be used to connect a users intent to view that node's content to a frontend page in their Gatsby site once a page has been built in Gatsby Cloud for that specific manifest ID.
At this point this may seem abstract to you but further points below will clarify how these pieces interact with each other. The important part to know here is that you need to construct an ID which is unique within your CMS and is tied to the content a user intends to view and which is identifiable to the point in time at which they updated that content.

#### Add a manifest ID to your Preview Webhooks

When sending webhooks to Gatsby Cloud to trigger builds you can send over a manifest ID on the webhook body. Your plugin can use this manifest ID during node sourcing but it doesn't have to if your plugin pulls updates from the CMS rather than pushing them via the webhook body. The current convention for sending the manifest ID on the webhook is `webhookBody.internal.manifestId`. If you plan to send your manifest ID on the webhook body you should stick to this convention for forwards compatibility in the event that Gatsby Cloud later has features added that uses this part of the webhook body.

#### Call createNodeManifest during sourceNodes

During node sourcing, call [`actions.unstable_createNodeManifest()`](https://www.gatsbyjs.com/docs/reference/config-files/actions/#unstable_createNodeManifest) on each node a user is intending to preview.
This action will link the `manifestId` to a page that was created from this node. This allows Content Loader to connect the `manifestId` to a users intent to view a built page and route them there once it's ready to view.

The example below shows using the `internal.manifestId` property from the webhook body but you could just as easily re-construct the `manifestId` on the Gatsby side from your node data, or you could store the manifestId in your CMS and pull it down with your data updates.

Note that you should not create a node manifest for every node you create, only for the nodes your users are updating. Uncached builds should not create node manifest files when initially syncing data from your CMS. Doing so could significantly slow down builds without benefiting the user.

```js
exports.sourceNodes = async ({ webhookBody, actions, createContentDigest }) => {
  const cmsNodeData = await exampleFetchCmsNodeUpdate(webhookBody.nodeId)

  const node = {
    ...cmsNodeData,
    internal: {
      type: `ExampleNode`,
      contentDigest: createContentDigest(cmsNodeData),
    },
  }

  actions.createNode(node)

  // Be sure to check that this action exists before calling it in case the user is on a version of Gatsby core which doesn't yet support this action.
  if (cmsNodeData && `unstable_createNodeManifest` in actions) {
    actions.unstable_createNodeManifest({
      manifestId: webhookBody.internal.manifestId,
      node,
    })
  }
}
```

#### Add a new CMS setting field for the Content Loader URL

In your CMS settings for Gatsby, you will need to add a field for Gatsby Clouds "Content Loader URL". This URL will be copied from users Gatsby Cloud dashboard into their CMS settings. For example the url will look something like `https://gatsbyjs.com/content-loader/3465891e-6888-40c2-8249-76c31e9f5add`. You'll notice that the url ends with a site id. It's important to have this setting be the full url rather than just the site ID to allow Gatsby Cloud engineers to debug the Content Loader locally if any issues arise with the loader and your CMS.

#### Add an "Open Preview" button to the content editing view of your CMS

This link will be used by your CMS users to open the content loader. It should begin with the "Content Loader URL" CMS setting mentioned in the section above but you should append a couple URL paths to the end of the URL which will be specific to your CMS. The first will be the source plugin name for your CMS and the second will be the manifest ID mentioned above. For example `https://gatsbyjs.com/content-loader/3465891e-6888-40c2-8249-76c31e9f5add/gatsby-source-example-cms/Post-id-1-modified-1628618395702`. Visiting this URL in a browser will cause the loader to start watching for pages being built from a node with the manifest ID `Post-id-1-modified-1628618395702` for the Gatsby Cloud site `3465891e-6888-40c2-8249-76c31e9f5add` within the source plugin `gatsby-source-example-cms`.

#### Always trigger a new build for the previewed content when a user opens the Content Loader

Since your CMS wont know wether or not a build has completed with your manifest ID, you should always send another webhook to Gatsby Cloud each time your user opens the Content Loader. If a build has previously completed with that manifest ID, the user will be redirected to their content immediately. Problems arise though if you send a user to the loader for a build that happened in the past. For example, if a user edited their content on Monday and previewed that content and then came back on Tuesday and opened the preview again via the Content Loader link without sending a webhook, the build from Monday may have been invalidated via a code update or if someone cleared the site cache. Sending a webhook request when the user opens the loader will make sure that the user is routed to the right place every time.

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

Each type has independent schemas and field(s) on that reference the other entity -- in this case the `Post` would have an `Author`, and the `Author` might have `Post`s. The API of a service that allows complex object modeling, for example a CMS, will often allow users to add relationships between entities and expose them through the API. This same relationship can be represented by your schema.

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

You can read more about connecting foreign key fields with schema customization in the guide on [customizing the GraphQL schema](/docs/reference/graphql-data-layer/schema-customization/#foreign-key-fields).

#### Option 2: transformation relationships

When a node is _completely_ derived from another node you'll want to use a transformation relationship. An example that is common in source plugins is for transforming File nodes from remote sources, e.g. images. You can read about this use case in the section below on [sourcing images from remote locations](/docs/creating-a-source-plugin/#sourcing-images-from-remote-locations).

You can find more information about transformation relationships in the [creating a transformer plugin guide](/docs/how-to/plugins-and-themes/creating-a-transformer-plugin/#creating-the-transformer-relationship).

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

A common use case for source plugins is pulling images from a remote location and optimizing them for use with [Gatsby Image](/plugins/gatsby-image/). An API may return a URL for an image on a CDN, which could be further optimized by Gatsby at build time.

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

Attaching `fileNode.id` to `remoteImage___NODE` will rely on Gatsby's [inference](/docs/glossary/#inference) of the GraphQL schema to create a new field `remoteImage` as a relationship between the nodes. This is done automatically. For a sturdier schema, you can relate them using [`schemaCustomization` APIs](/docs/reference/config-files/gatsby-node/#createSchemaCustomization) by adding the `fileNode.id` to a field that you reference when you `createTypes`:

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
        # fluid or fixed fields for optimized images
      }
    }
  }
}
```

### Improve plugin developer experience by enabling faster sync

One challenge when developing locally is that a developer might make modifications in a remote data source, like a CMS, and then want to see how it looks in the local environment. Typically they will have to restart the `gatsby develop` server to see changes. In order to improve the development experience of using a plugin, you can reduce the time it takes to sync between Gatsby and the data source by enabling faster synchronization of data changes. The best way to do this is by adding **event-based syncing**.

Some data sources keep event logs and are able to return a list of objects modified since a given time. If you're building a source plugin, you can store the last time you fetched data using the [cache](/docs/creating-a-source-plugin/#caching-data-between-runs) or [`setPluginStatus`](/docs/reference/config-files/actions/#setPluginStatus) and then only sync down nodes that have been modified since that time. [`gatsby-source-contentful`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-contentful) is an example of a source plugin that does this.

## Additional resources

- Working example repository on [creating source plugins](https://github.com/gatsbyjs/gatsby/tree/master/examples/creating-source-plugins) with the features in this guide implemented
- Tutorial on [Creating a Source Plugin](/docs/how-to/plugins-and-themes/creating-a-source-plugin/)
- [`gatsby-node-helpers`](https://github.com/angeloashmore/gatsby-node-helpers), a community-made npm package with helper functions to generate Node objects with required fields like IDs and the `contentDigest` MD5 hash.
