---
title: Node Creation
---

# Node Creation/Transformation/Storage

Nodes are created by calling the [createNode]() action. Nodes can be any object, as long as it doesn't contain certain [reserved fields](). 

A node is stored in redux under `state.nodes` as a map of the node ID to the actual node object. 

TODO: What's the deal with ___NODE. Including in infer-graphql-input-fields.

## Sourcing Nodes

Nodes are created in Gatsby by calling [createNode](). This happens primarily in the [sourceNodes]() bootstrap phase, though can happen in other places to (TODO: Find places). Nodes created during this phase are top level nodes. I.e, they have no parent. 

## Parent/child relationship

TODO: Must explicitly set parent: field when creating node?

TODO: used in data-tree-utils. Might make more sense when discussing schema? Used in build-node-types when resolving parent. Also used when finding rootNodeAncestor. and in source filesystem, create-file-path

A node can be linked to another node as a parent or child. To create this link, you must explicitly call the `createParentChildLink`. All this does is add the child node's ID to the parent's `children` array. And it then persist the parent back to `redux.nodes`.

TODO: [internal-data-bridge]() plugin?

Note, a `node.owner` refers to the plugin that created it, not the parent node.

## Fresh/stale nodes

Every time a build is re-run, there is a chance that a node that exists in the redux store no longer exists in the original data source. E.g a file might be deleted from disk between runs. We need a way to indicate that fact to Gatsby.

To track this, there is a `redux.nodesTouched` store that tracks whether a particular node ID has been touched. This occurs whenever a node is created (by handled [CREATE_NODE]()), or an explicit call to [touchNode](). 

When a source-nodes plugin runs, it generally recreates nodes (which touches them too). But in some cases, such as [transformer-screenshot](), a node might not change, but we still want to keep it around for the build. In these cases, we could have to explicitly call `touchNode`. 

Any nodes that aren't touched by the end of source-nodes, are deleted. This is performed by a diff on the `redux.nodesTouched` and `redux.nodes` collections. 

## Changing a node's fields

From a site developer's point of view, nodes are immutable. In the sense that if you simply change a node object, those changes will not be seen by other parts of Gatsby. To make a change to a node, it must be persisted to redux via an action.

So, how do you add a field to an existing node? E.g perhaps in onCreateNode, you want to add a transformer specific field? You can call [createNodeField]() and this will simply add your field to the node's `node.fields` object and then persists it to redux. This can then be referenced by other parts of your plugin at later stages of the build. 

## Internal Data Bridge

On sourceNodes, this plugin creates:

- a default SitePage node for `/dev-404-page/`. 
- a Node for each of the plugins previously loaded earlier in bootstrap. This node includes the contents of they plugin's package.json.
- a `Site` node that is the contents of `gatsby-config.js`, which was previously loaded into `redux.config`.
- Sets up a watcher to re-require `gatsby-config.js` and re-create the node if it ever changes

on createPage: 

- Create a new Node that is the same as the original page, but with type = `SitePage` and id = `SitePage ${path}`

And when a `DELETE_PAGE` event is emitted, it deletes the corresponding `SitePage` using [deleteNode]().

TODO: Where is all this used? Only reference to SitePage is in [gatsby-plugin-sitemap](). Talk about how this overall fits into the Gatsby build process

