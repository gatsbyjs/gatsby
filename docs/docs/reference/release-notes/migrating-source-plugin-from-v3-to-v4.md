# Upgrade your source plugins for Gatsby 4

Gatsby 4 is here! Following on the heels of Gatsby 3, Gatsby 4 further improves build performance and introduces new parallel processing capabilities. In the guide below, we'll walk you through preparing your source plugin for Gatsby 4.

Introducing support for Gatsby 4 in your source plugin is straightforward and can be accomplished in just a few days. With Gatsby 4, Core APIs are being split into different processes so they're able to run simultaneously in parallel instead of sequentially. Early results show at least 40% improvement of build performance.

Gatsby 4 also lays the groundwork for two new methods of rendering your Gatsby site: Server Side Rendering (SSR) and Deferred Static Rendering (DSR) to scale Gatsby to infinity and beyond.

Let's get into it! In the guide below, we'll outline the many breaking changes in Gatsby 4 and some quick ways we've found to resolve these. Checkout `gatsby-source-wordpress` and `gatsby-source-shopify` to see how we introduced support for Gatsby 4.

Find something confusing? Let us know and we'll respond as fast as possible.

## 1. Modification to Gatsby's GraphQL schema during "sourceNodes" is not allowed

We have three APIs: `createTypes`, `addThirdPartySchema`, `createFieldExtension` that can modify the schema. It's not allowed anymore to use them during the `sourceNodes` lifecycle. Please move these towards the `createSchemaCustomization` lifecycle.

### The Old Way

```javascript
exports.sourceNodes = ({ actions }) => {
  const { createTypes } = actions;

  createTypes({
    `
      type AuthorJson implements Node {
        joinedAt: Date
      }
    `
  })
}
```

### The New Way

```javascript
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  createTypes({
    `
      type AuthorJson implements Node {
        joinedAt: Date
      }
    `
  })
}
```

## 2. Data mutations need to happen during `sourceNodes` or `onCreateNode`

Creation or augmenting of nodes needs to happen in the appropriate APIs. Creating nodes inside resolvers is not allowed. You need to create the node upfront and add expensive operations inside your resolvers.

### The Old Way

```javascript
exports.createResolvers = ({
  createNodeId,
  actions,
  createResolvers,
  store,
  cache,
  reporter,
}) => {
  createResolvers({
    CustomImage: {
      localImage: {
        type: "File!",
        resolve: async (source, args, context, info) => {
          return createRemoteFileNode({
            url: source.url,
            parentNodeId: source.id,
            store,
            cache,
            createNode: actions.createNode,
            createNodeId,
            reporter,
          })
        },
      },
    },
  })
}
```

### The New Way

```javascript
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  createTypes({
    `
      type CustomImage implements Node {
        localImage: File!
      }
    `
  })
}

exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest,
  store,
  cache,
  reporter,
}) => {
  const { createNode } = actions

  // code to fetch data

  for (const { url } of remoteImages) {
    const nodeId = createNodeId(`my-data-${url}`)
    const image = await createRemoteFileNode({
      url: url,
      parentNodeId: nodeId,
      store,
      cache,
      createNode,
      createNodeId,
      reporter,
    })
    const node = {
      id: nodeId,
      parent: null,
      children: [],
      url,
      localImageId: image.id,
      internal: {
        type: `CustomImage`,
        content: url,
        contentDigest: createContentDigest(url),
      },
    }

    createNode(node)
  }
}
```

## 3. Global state

As I stated above, Gatsby is moving to parallelize bits of Gatsby. Running multiple processes means global variables might not contain the data that you hoped they would.

When a new process (worker) gets created, we run `onPluginInit` (a new lifecycle method in gatsby-node.js) to restore global state if needed.

We provide a helper function in `gatsby-plugin-utils` (make sure to add this explicitly to your dependencies) to check if this new API is available. This will help you keep backwards compatibility in V3 while moving forward to a V4 world. We also need to check if we are using the `stable` or `unstable` version of `onPluginInit`.

### The Old Way

```javascript
let globalPluginOptions = {}

exports.onPreBootstrap = (_, pluginOptions) => {
  globalPluginOptions = pluginOptions
}

function aDeepNestedFunction(arg) {
  if (globalPluginOptions.convert) {
    return arg.toUpperCase()
  } else {
    return arg
  }
}
```

### The New Way

```javascript
let coreSupportsOnPluginInit: "unstable" | "stable" | undefined

try {
  const { isGatsbyNodeLifecycleSupported } = require(`gatsby-plugin-utils`)
  if (isGatsbyNodeLifecycleSupported(`onPluginInit`)) {
    coreSupportsOnPluginInit = "stable"
  } else if (isGatsbyNodeLifecycleSupported(`unstable_onPluginInit`)) {
    coreSupportsOnPluginInit = "unstable"
  }
} catch (e) {
  console.error(`Could not check if Gatsby supports onPluginInit lifecycle`)
}

let globalPluginOptions = {}

const initializeGlobalState = (_, pluginOptions) => {
  globalPluginOptions = pluginOptions
}

if (coreSupportsOnPluginInit === "stable") {
  exports.onPluginInit = initializeGlobalState
} else if (coreSupportsOnPluginInit === "unstable") {
  exports.unstable_onPluginInit = initializeGlobalState
} else {
  exports.onPreInit = initializeGlobalState
}

function aDeepNestedFunction(arg) {
  if (globalPluginOptions.convert) {
    return arg.toUpperCase()
  } else {
    return arg
  }
}
```

## 4. Custom error map needs to be initiated in onPluginInit

To make it more clear for users when things go wrong, Gatsby has structured logs. It allows plugins to properly guide people to a solution by providing metadata such as urls to docs, … This feature needs to be initialized in onPluginInit to allow GraphQL resolvers to report these errors.

Similar to handling global state, we provide a helper function in `gatsby-plugin-utils` (make sure to add this explicitly to your dependencies) to check if this new API is available. This will help you keep backwards compatibility in V3 while moving forward to a V4 world.We also need to check if we are using the `stable` or `unstable` version of `onPluginInit`.

## The Old Way

```javascript
const ERROR_MAP = {
  [CODES.Generic]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    type: `PLUGIN`,
  },
  [CODES.MissingResource]: {
    text: context => context.sourceMessage,
    level: `ERROR`,
    type: `PLUGIN`,
    category: `USER`,
  },
}
exports.onPreInit = ({ reporter }) => {
  if (reporter.setErrorMap) {
    reporter.setErrorMap(ERROR_MAP)
  }
}
```

## The New Way

```javascript
let coreSupportsOnPluginInit: "unstable" | "stable" | undefined

try {
  const { isGatsbyNodeLifecycleSupported } = require(`gatsby-plugin-utils`)
  if (isGatsbyNodeLifecycleSupported(`onPluginInit`)) {
    coreSupportsOnPluginInit = "stable"
  } else if (isGatsbyNodeLifecycleSupported(`unstable_onPluginInit`)) {
    coreSupportsOnPluginInit = "unstable"
  }
} catch (e) {
  console.error(`Could not check if Gatsby supports onPluginInit lifecycle`)
}

const ERROR_MAP = {
  // error map
}

const initializePlugin = ({ reporter }) => {
  if (reporter.setErrorMap) {
    reporter.setErrorMap(ERROR_MAP)
  }
}

// need to conditionally export otherwise it throws an error for older versions
if (coreSupportsOnPluginInit === "stable") {
  exports.onPluginInit = initializePlugin
} else if (coreSupportsOnPluginInit === "unstable") {
  exports.unstable_onPluginInit = initializePlugin
} else {
  exports.onPreInit = initializePlugin
}
```

## Recommendations for publishing your new source plugin version

Publish a new version of their Gatsby 4 compatible package that references gatsby: ^4.0.0-next.0 to signal that the given source plugin version if specifically updated to work with Gatsby 4

- When first publishing, it is recommended that source plugin maintainers indicate their plugin versions are beta ( they publish with the @next tag as well, we can communicate to all our users that v4 for plugins live on the "next" tag )
- It is okay for source plugin authors to publish their beta versions in advance of Gatsby 4 beta ( perhaps preferred so that we don't have incompatibility as soon as folks attempt to use Gatsby 4 )
