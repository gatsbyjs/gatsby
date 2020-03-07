---
title: Data Storage (Redux)
---

During Gatsby's bootstrap & build phases, the state is stored and manipulated using the [Redux](https://redux.js.org/) library. The key purpose of using Redux in Gatsby internals is to centralize all of the state logic. Reviewing the Gatsby [reducers](https://github.com/gatsbyjs/gatsby/tree/80acb8d5d67f7e277ce44158b36da84d262e5b23/packages/gatsby/src/redux/reducers) and [actions](https://github.com/gatsbyjs/gatsby/tree/80acb8d5d67f7e277ce44158b36da84d262e5b23/packages/gatsby/src/redux/actions) folders gives a comprehensive picture of what state manipulations are possible.

## Store

The namespaces in Gatsby's Redux store are a great overview of the Gatsby internals, here are a few:

- [Nodes](/docs/node-interface/) - All data that’s added to Gatsby is modeled using nodes. Nodes are most commonly added by Source plugins such as `gatsby-source-filesystem`.
- [Schema](/docs/schema-generation/) - GraphQL schema inferred from Nodes, available for querying by page and static queries.
- [Pages](/docs/gatsby-internals-terminology/#page) - A mapping of page paths to page objects. Page objects contain information needed to render a page such as component file path, page query and context.
- [Components](/docs/gatsby-internals-terminology/#component) - A mapping of component file paths to page objects.
- [Static Query Components](/docs/gatsby-internals-terminology/#component) - A collection of the components detected with static queries.
- Jobs - Long-running processes, generally started as a side-effect to a GraphQL query. Gatsby doesn’t finish its process until all jobs are ended.
- Webpack - Config for the [Webpack](https://webpack.js.org/) tool which handles code optimization and splitting of delivered javascript bundles.

The Gatsby [/redux index file](https://github.com/gatsbyjs/gatsby/tree/80acb8d5d67f7e277ce44158b36da84d262e5b23/packages/gatsby/src/redux/index.ts) has two key exports, `store` and `emitter`. Throughout the bootstrap and build phases, `store` is used to get the current state and dispatch actions, while `emitter` is used to register listeners for particular actions. The store is also made available to Gatsby users through the [Node APIs](/docs/node-apis/).

## Actions

Actions dispatched can have a series of effects as different reducers pick them up. Gatsby augments the typical Redux reducer with a pubsub [mitt](https://www.npmjs.com/package/mitt) `emitter` which subscribes to the Redux store to perform further side-effects.

Actions dispatched in the store cause state changes through the reducers and also trigger listeners registered for that action on the `emitter`. While the `subscribe` Redux store method is typically used to connect a web framework like React, Gatsby only uses the `subscribe` method to connect the `emitter`.

The [Gatsby actions](/docs/actions/) are all either internal, public or restricted. The public actions, and a context relevant subset of the restricted actions, are available to users through the [Node APIs](/docs/node-apis/).

### Action Journey

At the time of writing there are 10 places in the code where `CREATE_NODE` type actions are dispatched, and 10 places where they are acted on through either reducers or `emitter` listeners.

Here is the journey of the [createRedirect](/docs/actions/#createRedirect) public action through defining, exposing and dispatching:

- **Reducer case** - [redirects.js](https://github.com/gatsbyjs/gatsby/blob/80acb8d5d67f7e277ce44158b36da84d262e5b23/packages/gatsby/src/redux/reducers/redirects.js#L28) - The redirects reducer will catch actions with a type `CREATE_REDIRECT` and make the necessary state manipulation.

- **Side effect** - [redirects-writer.js](https://github.com/gatsbyjs/gatsby/blob/80acb8d5d67f7e277ce44158b36da84d262e5b23/packages/gatsby/src/bootstrap/redirects-writer.js#L44) - An `emitter` listener is registered for the `CREATE_REDIRECT` action type.

- **Action creator** - [public.js](https://github.com/gatsbyjs/gatsby/blob/80acb8d5d67f7e277ce44158b36da84d262e5b23/packages/gatsby/src/redux/actions/public.js#L1358) - An action creator, `createRedirect`, is defined in the public actions file. The action has a payload, the information needed to complete the action, and a type, the string that identifies this particular action.

- **Expose bound action creator** - [api-runner-node.js](https://github.com/gatsbyjs/gatsby/blob/80acb8d5d67f7e277ce44158b36da84d262e5b23/packages/gatsby/src/utils/api-runner-node.js#L102) - `createRedirect` is one of the public actions made available to all of the [Node APIs](/docs/node-apis/). Node APIs are all run by the `apiRun` function found in `api-runner-node.js`. A collection of public actions and the restricted actions available to the called API are bound to the Redux store dispatch. The bound action collection is then passed when calling the user's API function.

- **Dispatch** - Here is an example of the `createRedirect` call that a Gatsby user could make with the [createPages](/docs/node-apis/#createPages) API in their project's [gatsby-node.js](/docs/api-files-gatsby-node/) file:

```javascript:title=gatsby-node.js
module.exports = {
  createPages: ({ actions }) => {
    const { createRedirect } = actions
    createRedirect({
      fromPath: "/legacy-path",
      toPath: "/current-path",
    })
  },
}
```
