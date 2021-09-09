---
title: Migrating from v3 to v4
---

Looking for the [v3 docs](https://v3.gatsbyjs.com)?

> Have you run into something that's not covered here? [Add your changes to GitHub](https://github.com/gatsbyjs/gatsby/tree/master/docs/docs/reference/release-notes/migrating-from-v3-to-v4.md)!

## Introduction

This is a reference for upgrading your site from Gatsby 3 to Gatsby 4. Version 4 is currently in Beta and thus this guide is not finalized yet. While the (breaking) changes might slightly change during the Beta and Release Candidate period the major breaking changes are already in and following this guide should set you up for success when the stable release is available.

## Table of Contents

- [Updating Your Dependencies](#updating-your-dependencies)
- [Handling Breaking Changes](#handling-breaking-changes)
- [Future Breaking Changes](#future-breaking-changes)
- [For Plugin Maintainers](#for-plugin-maintainers)
- [Known Issues](#known-issues)

## Updating Your Dependencies

First, you need to update your dependencies.

### Update Gatsby version

You need to update your `package.json` to use the `next` version of Gatsby.

```json:title=package.json
{
  "dependencies": {
    "gatsby": "next"
  }
}
```

Or run

```shell
npm install gatsby@next
```

**Please note:** If you use **npm 7** you'll want to use the `--legacy-peer-deps` option when following the instructions in this guide. For example, the above command would be:

```shell
npm install gatsby@next --legacy-peer-deps
```

### Update Gatsby related packages

Update your `package.json` to use the `next` version of Gatsby related packages. You should upgrade any package name that starts with `gatsby-*`. Note, this only applies to plugins managed in the [gatsbyjs/gatsby](https://github.com/gatsbyjs/gatsby) repository. If you're using community plugins, they might not be upgraded yet. Please check their repository for the current status. You can run an npm script to see all outdated dependencies.

> TODO: Add npm/yarn section once stable as they don't show `next` tags, only `latest`

#### Updating community plugins

Using community plugins, you might see warnings like these in your terminal:

```shell
warning Plugin gatsby-plugin-acme is not compatible with your gatsby version 4.0.0 - It requires gatsby@^3.10.0
```

If you are using npm 7, the warning may instead be an error:

```shell
npm ERR! ERESOLVE unable to resolve dependency tree
```

This is because the plugin needs to update its `peerDependencies` to include the new version of Gatsby (see section [for plugin maintainers](#for-plugin-maintainers)). While this might indicate that the plugin has incompatibilities, in most cases they should continue to work. When using npm 7, you can pass the `--legacy-peer-deps` to ignore the warning and install anyway. Please look for already opened issues or PRs on the plugin's repository to see the status. If you don't see any, help the maintainers by opening an issue or PR yourself! :)

## Handling Breaking Changes

This section explains breaking changes that were made for Gatsby 4. Some of those changes had a deprecation message in v3. In order to successfully update, you'll need to resolve these changes.

### Minimal Node.js version 14.15.0

We are dropping support for Node 12 as a new underlying dependency (`lmdb-store`) is requiring `>=14.15.0`. See the main changes in [Node 14 release notes](https://nodejs.org/en/blog/release/v14.0.0/).

Check [Node’s releases document](https://github.com/nodejs/Release#nodejs-release-working-group) for version statuses.

### Disallow schema-related APIs in `sourceNodes`

You can no longer use `createFieldExtension`, `createTypes` & `addThirdPartySchema` inside the [`sourceNodes`](/docs/reference/config-files/gatsby-node#sourceNodes) lifecycle.

You'll need to use the [`createSchemaCustomization`](/docs/reference/config-files/gatsby-node#createSchemaCustomization) & [`createResolvers`](/docs/reference/config-files/gatsby-node#createResolvers) APIs to execute schema-related actions. The reasoning behind this is that this way Gatsby can safely build the schema and run queries in a separate process without running sourcing.

### `touchNode`

For Gatsby v2 & v3 the `touchNode` API accepted `nodeId` as a named argument. This now has been changed in favor of passing the full `node` to the function.

```diff:title=gatsby-node.js
exports.sourceNodes = ({ actions, getNodesByType }) => {
  const { touchNode } = actions

- getNodesByType("YourSourceType").forEach(node => touchNode({ nodeId: node.id }))
+ getNodesByType("YourSourceType").forEach(node => touchNode(node))
}
```

In case you only have an ID at hand (e.g. getting it from cache), you can use the `getNode()` API:

```js:title=gatsby-node.js
exports.sourceNodes = async ({ actions, getNodesByType, cache }) => {
  const { touchNode, getNode } = actions
  const myNodeId = await cache.get("some-key")

  touchNode(getNode(myNodeId))
}
```

### `deleteNode`

For Gatsby v2 & v3, the `deleteNode` API accepted `node` as a named argument. This now has been changed in favor of passing the full `node` to the function.

```diff:title=gatsby-node.js
exports.onCreateNode = ({ actions, node }) => {
  const { deleteNode } = actions

- deleteNode({ node })
+ deleteNode(node)
}
```

### `@nodeInterface`

For Gatsby v2 & v3, `@nodeInterface` was the recommended way to implement [queryable interfaces](/docs/reference/graphql-data-layer/schema-customization/#queryable-interfaces-with-the-nodeinterface-extension).
Now it is changed in favor of interface inheritance:

```diff:title=gatsby-node.js
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  createTypes(`
-   interface Foo @nodeInterface
+   interface Foo implements Node
    {
      id: ID!
    }
  `)
}
```

### Setting values on module context outside of `onPluginInit`

Sites and in particular plugins that rely on setting values on module context to access them later in other lifecycles will need to use `onPluginInit`.

> TODO: More explanation & examples

This also applies to using the `reporter.setErrorMap` function. It now also needs to be run inside `onPluginInit`.

> TODO: Example

### Removal of obsolete flags

The config flags for `QUERY_ON_DEMAND` and `PRESERVE_WEBPACK_CACHE` have been removed since the features are enabled by default. Thus you can't explicitly opt-out of these anymore.

### Node mutation & creation in custom resolvers

TODO

## Future Breaking Changes

This section explains deprecations that were made for Gatsby 4. These old behaviors will be removed in v5, at which point they will no longer work. For now, you can still use the old behaviors in v4, but we recommend updating to the new signatures to make future updates easier.

### `nodeModel.runQuery`

TODO

### `nodeModel.getAllNodes`

TODO

### `___NODE` convention

TODO

## For Plugin Maintainers

In most cases, you won't have to do anything to be v4 compatible. The underlying changes mostly affect **source** plugins. But one thing you can do to be certain your plugin won't throw any warnings or errors is to set the proper peer dependencies.

Please also note that some of the items inside "Handling Breaking Changes" may also apply to your plugin.

`gatsby` should be included under `peerDependencies` of your plugin and it should specify the proper versions of support.

```diff:title=package.json
{
  "peerDependencies": {
-   "gatsby": "^3.0.0",
+   "gatsby": "^4.0.0",
  }
}
```

If your plugin supports both versions:

```diff:title=package.json
{
  "peerDependencies": {
-   "gatsby": "^2.32.0",
+   "gatsby": "^3.0.0 || ^4.0.0",
  }
}
```

### Don't mutate data outside of expected APIs

This is an anti-pattern in some plugins that will no longer work with LMDB. You shouldn't mutate data after the `createNode` call. In Gatsby 4 the nodes are only stored once (when sourcing them) and any mutations afterwards are lost.

> TODO: Example of current anti-pattern + proposed better solution

### No support for circular references in data

The current state persistence mechanism supported circular references in nodes. With Gatsby 4 and LMDB this is no longer supported.

> TODO: More details here?

## Known Issues

This section is a work in progress and will be expanded when necessary. It's a list of known issues you might run into while upgrading Gatsby to v4 and how to solve them.
