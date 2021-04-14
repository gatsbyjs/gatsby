---
title: Node Model
description: Documentation explaining the model of nodes in Gatsby's GraphQL data layer
jsdoc: ["src/schema/node-model.js"]
apiCalls: NodeModel
contentsHeading: Methods
---

Gatsby exposes its internal data store and query capabilities to GraphQL field resolvers on `context.nodeModel`.

## Example Usage

```javascript:title=gatsby-node.js
createResolvers({
  Query: {
    mood: {
      type: `String`,
      resolve(source, args, context, info) {
        const coffee = context.nodeModel.getAllNodes({ type: `Coffee` })
        if (!coffee.length) {
          return 😞
        }
        return 😊
      },
    },
  },
})
```
