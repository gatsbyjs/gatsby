---
title: Node Creation
---

#### early in the build

Early in the bootstrap phase, we load all the configured plugins (and internal plugins) for the site. These are saved into redux under:

- **flattenedPlugins**: All plugins in the system, each contains the following information:
  - **resolve**: path to the plugin's directory
  - **id**: String concatenation of 'Plugin ' and the name of the plugin. E.g 'Plugin query-runner'
  - **name**: The name of the plugin. E.g 'query-runner'
  - **version**: The version as per the package.json. Or one is generated from the file's hash
  - **pluginOptions**: Plugin options as specified in `gatsby-config.js`
  - **nodeAPIs**: A list of node APIs that this plugin implements. E.g [ 'sourceNodes', ...]
  - **browserAPIs**: List of browser APIs that this plugin implements
  - **ssrAPIs**: List of SSR APIs that this plugin implements
- **api-to-plugins**: A map of apis to to all the plugins that implement it

#### apiRunInstance

Some API calls can take a while to finish. So every time an API is run, we create an object called `apiRunInstance` to track it. It contains the following fields:

- **api**: The API we're running. E.g `onCreateNode`
- **args**: Any arguments passed to `api-runner-node`. E.g a node object
- **pluginSource**: optional name of the plugin that initiated the original call. 
- **resolve**: promise resolve callback to be called when the API has finished running
- **startTime**: time that the API run was started
- **traceId**: optional args.traceId provided if API will result in further API calls (see below)

We immediately place this object into an `apisRunningById` Map.

#### waiting for all plugins to run

Next, we run all the plugins that implement the API. We run them concurrently by using the [map-series]() library. We then wait for all the `apiRunInstance.resolve` functions to be called, resulting an an array of results. We then call the original `api-runner-node` promise's resolve function with the results of the call, and we're done.

#### running each plugin

Each plugin implements an API by implementing the APIs function as defined in [api-node-docs.js](). So to run the plugin, we first `require` it via its `plugin.resolve` field. And then we call its `plugin[api]` function with the originally provided args. If the plugin provides a callback, we return a promise that resolves when that callback is resolved. Otherwise, we run the plugin synchronously and return it in a new promise.

#### closing over plugin/traceId for actions

In addition to the primary arguments, most Gatsby actions allow for an additional `plugin` and `traceId` field. E.g in [createPage](). Ordinarily, a plugin that calls these actions would have to add extra boilerplate to pass this plugina and traceId to every single function. To make the developer's life easier, Gatsby redefines the actions that are passed to the implementing plugin so that the `plugin` and `traceId` fields are included automatically (if not explicitly provided by the implementing plugin).

#### using traceID to await downstream API calls

The majority of API calls result in one or more implementing plugins being called. We then wait for them all to complete, and return. But some plugins (e.g [sourceNodes]()) result in calls to actions that themselves call APIs. We need some way of tracing whether an API call originated from another API call, so that we can wait on all children to complete. The mechanism for this is the `traceId`.

The traceID is passed as an argument to the original API runner. Using the action rebinding mentioned above, the traceId is passed through to all action calls, which are then automatically passed to downstream API calls. You can see the traceId being passed through to the api runner call via the [plugin-runner.js]().

### Node Creation/Transformation/Storage

Nodes are created by calling the [createNode]() action. Nodes can be any object, as long as it doesn't contain certain [reserved fields](). 

A node is stored in redux under `state.nodes` as a map of the node ID to the actual node object. 

TODO: What's the deal with ___NODE. Including in infer-graphql-input-fields.

#### Sourcing Nodes

Nodes are created in Gatsby by calling [createNode](). This happens primarily in the [sourceNodes]() bootstrap phase, though can happen in other places to (TODO: Find places). Nodes created during this phase are top level nodes. I.e, they have no parent. 

#### Parent/child relationship

TODO: Must explicitly set parent: field when creating node?

TODO: used in data-tree-utils. Might make more sense when discussing schema? Used in build-node-types when resolving parent. Also used when finding rootNodeAncestor. and in source filesystem, create-file-path

A node can be linked to another node as a parent or child. To create this link, you must explicitly call the `createParentChildLink`. All this does is add the child node's ID to the parent's `children` array. And it then persist the parent back to `redux.nodes`.

TODO: [internal-data-bridge]() plugin?

Note, a `node.owner` refers to the plugin that created it, not the parent node.

#### Fresh/stale nodes

Every time a build is re-run, there is a chance that a node that exists in the redux store no longer exists in the original data source. E.g a file might be deleted from disk between runs. We need a way to indicate that fact to Gatsby.

To track this, there is a `redux.nodesTouched` store that tracks whether a particular node ID has been touched. This occurs whenever a node is created (by handled [CREATE_NODE]()), or an explicit call to [touchNode](). 

When a source-nodes plugin runs, it generally recreates nodes (which touches them too). But in some cases, such as [transformer-screenshot](), a node might not change, but we still want to keep it around for the build. In these cases, we could have to explicitly call `touchNode`. 

Any nodes that aren't touched by the end of source-nodes, are deleted. This is performed by a diff on the `redux.nodesTouched` and `redux.nodes` collections. 

#### Changing a node's fields

From a site developer's point of view, nodes are immutable. In the sense that if you simply change a node object, those changes will not be seen by other parts of Gatsby. To make a change to a node, it must be persisted to redux via an action.

So, how do you add a field to an existing node? E.g perhaps in onCreateNode, you want to add a transformer specific field? You can call [createNodeField]() and this will simply add your field to the node's `node.fields` object and then persists it to redux. This can then be referenced by other parts of your plugin at later stages of the build. 

#### Internal Data Bridge

On sourceNodes, this plugin creates:

- a default SitePage node for `/dev-404-page/`. 
- a Node for each of the plugins previously loaded earlier in bootstrap. This node includes the contents of they plugin's package.json.
- a `Site` node that is the contents of `gatsby-config.js`, which was previously loaded into `redux.config`.
- Sets up a watcher to re-require `gatsby-config.js` and re-create the node if it ever changes

on createPage: 

- Create a new Node that is the same as the original page, but with type = `SitePage` and id = `SitePage ${path}`

And when a `DELETE_PAGE` event is emitted, it deletes the corresponding `SitePage` using [deleteNode]().

TODO: Where is all this used? Only reference to SitePage is in [gatsby-plugin-sitemap](). Talk about how this overall fits into the Gatsby build process

