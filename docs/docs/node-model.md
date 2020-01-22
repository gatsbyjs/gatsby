---
title: Node Model
jsdoc: ["gatsby/src/schema/node-model.js"]
apiCalls: NodeModel
contentsHeading: Methods
---

Gatsby exposes its internal data store and query capabilities to GraphQL field resolvers on `context.nodeModel`.

## Example Usage

### gatsby-node.js

```javascript
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
