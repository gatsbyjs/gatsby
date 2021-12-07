---
title: Debugging missing or stale data fields on nodes
---

## Overview of `LMDB` datastore behavior changes

In Gatsby 3 we introduced new data store - `LMDB` (enabled with `LMDB_STORE` and/or `PARALLEL_QUERY_RUNNING` flags). In Gatsby 4 it became the default data store. It allows us to execute data layer related processing outside of main build process and enable us to run queries in multiple processes as well as support additional rendering strategies (DSG and SSR).

In a lot of cases that change is completely invisible to users, but there are cases where things behave differently.

Direct node mutations in various API lifecycles are not persisted anymore. In previous Gatsby versions it did work because source of truth for our data layer was directly in Node.js memory, so mutating node was in fact mutating source of truth. Now we edit data we received from database, so unless we explicitly upsert data to database after edits, those edits will not be persisted (even for same the same build).

Common errors when doing swap to `LMDB` will be that some fields don't exist anymore or are `null`/`undefined` when trying to execute graphql queries.

## Diagnostic mode

Gatsby (starting with version 4.4) can detect those node mutations. Unfortunately it adds measurable overhead so we don't enable it by default, and only let users to opt into it when they see data related issues (particularly when they didn't have this issue before using `LMDB`). To enable diagnostic mode:

- use truthy environment variable `GATSBY_DETECT_NODE_MUTATIONS`:
  ```
  GATSBY_DETECT_NODE_MUTATIONS=1 gatsby build
  ```
- or use `DETECT_NODE_MUTATIONS` config flag:
  ```javascript:title=gatsby-config.js
  module.exports = {
    flags: {
      DETECT_NODE_MUTATIONS: true,
    },
  }
  ```

Example diagnostic message you might see:

```
warn Node mutation detected

File <rootDir>/plugins/transform/gatsby-node.js:4:20
  2 |   if (node.internal.type === `Test`) {
  3 |     // console.log(`[Mutating node in onCreateNode]`)
> 4 |     node.nested.a2 = `edited`
    |                    ^
  5 |   }
  6 | }
  7 |

Stack trace:
    at Object.exports.onCreateNode (<rootDir>/plugins/transform/gatsby-node.js:4:20)
    at runAPI (<rootDir>/node_modules/gatsby/src/utils/api-runner-node.js:462:22)
    at Promise.catch.decorateEvent.pluginName
(<rootDir>/node_modules/gatsby/src/utils/api-runner-node.js:613:13)
    at Promise._execute
(<rootDir>/node_modules/bluebird/js/release/debuggability.js:384:9)
    at Promise._resolveFromExecutor
(<rootDir>/node_modules/bluebird/js/release/promise.js:518:18)
    at new Promise (<rootDir>/node_modules/bluebird/js/release/promise.js:103:10)
    at <rootDir>/node_modules/gatsby/src/utils/api-runner-node.js:611:16
    at tryCatcher (<rootDir>/node_modules/bluebird/js/release/util.js:16:23)
    at Object.gotValue (<rootDir>/node_modules/bluebird/js/release/reduce.js:166:18)
    at Object.gotAccum (<rootDir>/node_modules/bluebird/js/release/reduce.js:155:25)
    at Object.tryCatcher (<rootDir>/node_modules/bluebird/js/release/util.js:16:23)
    at Promise._settlePromiseFromHandler
(<rootDir>/node_modules/bluebird/js/release/promise.js:547:31)
    at Promise._settlePromise
(<rootDir>/node_modules/bluebird/js/release/promise.js:604:18)
    at Promise._settlePromiseCtx
(<rootDir>/node_modules/bluebird/js/release/promise.js:641:10)
    at _drainQueueStep (<rootDir>/node_modules/bluebird/js/release/async.js:97:12)
    at _drainQueue (<rootDir>/node_modules/bluebird/js/release/async.js:86:9)
```

It will point to code that is trying to mutate nodes. Note that it might also point to installed plugins in which case plugin maintainer should be notified about it.

Be sure to stop using this mode once you find and handle all problematic code paths as it will decrease performance.

## Migration

### Mutating a node in `onCreateNode`

Instead of mutating node directly, `createNodeField` action should be used instead. This way we will update source of truth (actually update node in datastore). `createNodeField` will create that additional field under `fields.fieldName`. If you want to preserve schema shape, so that additional field is on the root of a node you can use schema customization.

```diff
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

exports.onCreateNode = async ({
  node, // the node that was just created
-  actions: { createNode },
+  actions: { createNode, createNodeField },
  createNodeId,
  getCache,
}) => {
  if (node.internal.type === `SomeNodeType`) {
    const fileNode = await createRemoteFileNode({
      // the url of the remote image to generate a node for
      url: node.imgUrl,
      parentNodeId: node.id,
      createNode,
      createNodeId,
      getCache,
    })

    if (fileNode) {
-      node.localFile___NODE = fileNode.id
+      createNodeField({ node, name: 'localFile', value: fileNode.id })
    }
  }
}
+
+exports.createSchemaCustomization = ({ actions }) => {
+  const { createTypes } = actions
+
+  createTypes(`
+    type SomeNodeType implements Node {
+      localFile: File @link(from: "fields.localFile")
+    }
+  `)
+}
```
