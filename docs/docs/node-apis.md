---
title: Gatsby Node APIs
description: Documentation on Node APIs used in Gatsby build process for common uses like creating pages
jsdoc: ["gatsby/src/utils/api-node-docs.js"]
apiCalls: NodeAPI
---

Gatsby gives plugins and site builders many APIs for controlling your site's data in the GraphQL data layer.

## Async plugins

If your plugin performs async operations (disk I/O, database access, calling remote APIs, etc.) you must either return a promise or use the callback passed to the 3rd argument. Gatsby needs to know when plugins are finished as some APIs, to work correctly, require previous APIs to be complete first. See [Debugging Async Lifecycles](/docs/debugging-async-lifecycles/) for more info.

```javascript
// Promise API
exports.createPages = () => {
  return new Promise((resolve, reject) => {
    // do async work
  })
}

// Callback API
exports.createPages = (_, pluginOptions, cb) => {
  // do Async work
  cb()
}
```

If your plugin does not do async work, you can just return directly.

## Usage

Implement any of these APIs by exporting them from a file named `gatsby-node.js` in the root of your project.
