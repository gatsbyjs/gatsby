---
title: Node API Helpers
description: Documentation on API helpers for creating nodes within Gatsby's GraphQL data layer
jsdoc: ["src/utils/api-node-helpers-docs.js"]
apiCalls: NodeAPIHelpers
contentsHeading: Shared helpers
showTopLevelSignatures: true
---

The first argument passed to each of [Gatsby’s Node APIs](/docs/reference/config-files/gatsby-node/) is an object containing a set of helpers. Helpers shared by all Gatsby’s Node APIs are documented in [Shared helpers](#apis) section.

```js:title=gatsby-node.js
exports.createPages = gatsbyNodeHelpers => {
  const { actions, reporter } = gatsbyNodeHelpers
  // use helpers
}
```

Common convention is to destructure helpers right in argument list:

```js:title=gatsby-node.js
exports.createPages = ({ actions, reporter }) => {
  // use helpers
}
```

The [Creating a Source Plugin tutorial](/docs/tutorial/creating-a-source-plugin/part-4/) explains some of the [Shared helpers](#apis) in more detail.

## Note

Some APIs provide additional helpers. For example `createPages` provides `graphql` function. Check documentation of specific APIs in [Gatsby Node APIs](/docs/reference/config-files/gatsby-node/) for details.
