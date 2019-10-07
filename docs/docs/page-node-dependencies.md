---
title: Page -> Node Dependency Tracking
---

In almost every GraphQL Resolver, you'll see the [createPageDependency](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/redux/actions.js#L788), or [getNodeAndSavePathDependency](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/redux/index.js#L198) functions. These are responsible for recording which nodes are depended on by which pages. In `develop` mode, if a node's content changes, we re-run pages whose queries depend on that node. This is one of the things that makes `develop` so awesome.

## How dependencies are recorded

Recording of Page -> Node dependencies are handled by the [createPageDependency](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/redux/actions.js#L788) action. It takes the page (in the form of its `path`), and either a `nodeId`, or `connection`.

If a `nodeId` is passed, we're telling Gatsby that the page depends specifically on this node. So, if the node is changed, then the page's query needs to be re-executed.

`connection` is a Type string. E.g. `MarkdownRemark`, or `File`. If `createPageDependency` is called with a page path and a `connection`, we are telling Gatsby that this page depends on all nodes of this type. Therefore if any node of this type changes (e.g. a change to a markdown node), then this page must be rebuilt. This variant is only called from [run-sift.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/schema/run-sift.js#L264) when we're running a query such as `allFile`, or `allMarkdownRemark`. See [Schema Connections](/docs/schema-connections/) for more info.

## How dependencies are stored

Page -> Node dependencies are tracked via the `componentDataDependencies` redux namespace. `createPageDependency` is the only way to mutate it. The namespace is comprised of two sub structures:

```javascript
{
  nodes: { ... }, // mapping nodeId -> pages
  connections: { ... } // mapping of type names -> pages
}
```

**Nodes** is a map of nodeID to the set of pages that depend on that node. E.g

```javascript
// state.componentDataDependencies.nodes
{
  `ID of Some MarkdownRemark node`: [
    `blogs/my-blog1`,
    `blogs/my-blog2`
  ],
  `otherId`: [ `more pages`, ...].
  ...
}
```

**Connections** is a map of type name to the set of pages that depend on that type. e.g

```javascript
// state.componentDataDependencies.connections
{
  `MarkdownRemark`: [
    `blogs/my-blog1`,
    `blogs/my-blog2`
  ],
  `File`: [ `more pages`, ... ],
  ...
}
```

## How dependency information is used

Page -> Node dependencies are used entirely during query execution to figure out which nodes are "dirty", and therefore which page's queries need to be re-executed. This occurs in `page-query-runner.js` in the [findIdsWithoutDataDependencies](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/page-query-runner.js#L89) and [findDirtyIds](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/page-query-runner.js#L171) functions. This is described in greater detail in the [Query Execution](/docs/query-execution/) docs.

## Other forms

### add-page-dependency.js

[redux/actions/add-page-dependency.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/redux/actions/add-page-dependency.js) is a wrapper around the `createPageDependency` action that performs some additional performance optimizations. It should be used instead of the raw action.

### getNodeAndSavePathDependency action

The [getNodeAndSavePathDependency](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/redux/index.js#L198) action simply calls `getNode`, and then calls `createPageDependency` using that result. It is a programmer convenience.
