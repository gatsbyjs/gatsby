---
title: Node Creation
---

Nodes are created by calling the [createNode](/docs/actions/#createNode) action. Nodes can be any object.

A node is stored in redux under the `nodes` namespace, whose state is a map of the node ID to the actual node object.

## Sourcing Nodes

Nodes are created in Gatsby by calling [createNode](/docs/actions/#createNode). This happens primarily in the [sourceNodes](/docs/node-apis/#sourceNodes) bootstrap phase. Nodes created during this phase are top level nodes. I.e, they have no parent. This is represented by source plugins setting the node's `parent` field to `___SOURCE___`. Nodes created via transform plugins (who implement [onCreateNode](/docs/node-apis/#onCreateNode)) will have source nodes as their parents, or other transformed nodes. For a rough overview of what happens when source nodes run, see the [traceID illustration](/docs/how-plugins-apis-are-run/#using-traceid-to-await-downstream-api-calls).

## Fresh/stale nodes

Every time a build is re-run, there is a chance that a node that exists in the redux store no longer exists in the original data source. E.g a file might be deleted from disk between runs. We need a way to indicate that fact to Gatsby.

To track this, there is a redux `nodesTouched` namespace that tracks whether a particular node ID has been touched. This occurs whenever a node is created (handled by [CREATE_NODE](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/redux/reducers/nodes-touched.js)), or an explicit call to [touchNode](/docs/actions/#touchNode).

When a `source-nodes` plugin runs again, it generally recreates nodes (which automatically touches them too). But in some cases, such as [transformer-screenshot](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-transformer-screenshot/src/gatsby-node.js#L56), a node might not change, but we still want to keep it around for the build. In these cases, we must explicitly call `touchNode`.

Any nodes that aren't touched by the end of the `source-nodes` phase, are deleted. This is performed via a diff between the `nodesTouched` and `nodes` redux namespaces, in [source-nodes.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/source-nodes.js)

## Changing a node's fields

From a site developer's point of view, nodes are immutable. In the sense that if you simply change a node object, those changes will not be seen by other parts of Gatsby. To make a change to a node, it must be persisted to redux via an action.

So, how do you add a field to an existing node? E.g perhaps in onCreateNode, you want to add a transformer specific field? You can call [createNodeField]() and this will simply add your field to the node's `node.fields` object and then persists it to redux. This can then be referenced by other parts of your plugin at later stages of the build.

## `${field}___NODE` fields

You may notice references to node fields ending in `___NODE`. These signify foreign key relationships to some other node. For more info on how to use this, see the [create-source-plugin](/docs/create-source-plugin/) tutorial.
