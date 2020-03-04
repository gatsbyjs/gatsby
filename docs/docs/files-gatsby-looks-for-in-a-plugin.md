---
title: Creating a Generic plugin
---

This section is aimed at explaining the structure of a gatsby plugin and the files that are needed to create it.

As seen in the [what is a plugin doc](/docs/what-is-a-plugin/) is a piece of software that acts as an add-on and gives your site additional functionality.

They contain a file, usually in the project root, called `package.json` - this file holds various metadata relevant to the project. This file is used to give information to npm that allows it to identify the project as well as handle the project's dependencies.
The process of initializing a `package.json` in a project is done by running :

```shell
  npm init
```

## What files does Gatsby look for in a plugin?

After running the initialization command. You would need to provide information for the `package.json`

> All files are optional unless specifically marked as required.

- `package.json` — [required] this can be an empty object (`{}`) for local plugins.
  - `name` is used to identify the plugin when it mutates Gatsby’s GraphQL data structure
    - if `name` isn’t set, the folder name for the plugin is used
  - `main` is the [name of the file that will be loaded when your module is required by another application](https://docs.npmjs.com/creating-node-js-modules#create-the-file-that-will-be-loaded-when-your-module-is-required-by-another-application)
    - if `main` isn’t set, a default name of `index.js` will be used
    - if `main` isn't set, it is recommended (but not required) to create an empty index.js file with the contents `//no-op` (short for no-operation), as seen in this [example plugin](https://github.com/gatsbyjs/gatsby/tree/817a6c14543c73ea8f56c9f93d401b03adb44e9d/packages/gatsby-source-wikipedia)
  - `version` is used to manage the cache — if it changes, the cache is cleared
    - if `version` isn’t set, an MD5 hash of the `gatsby-*` file contents is used to invalidate the cache
    - omitting the `version` field is recommended for local plugins
  - `keywords` is used to make your plugin discoverable
    - plugins published on the npm registry should have `gatsby` and `gatsby-plugin` in the `keywords` field to be added to the [Plugin Library](/packages/)
- `gatsby-browser.js` — usage details are in the [browser API reference](/docs/browser-apis/)
- `gatsby-node.js` — usage details are in the [Node API reference](/docs/node-apis/)
- `gatsby-ssr.js` — usage details are in the [SSR API reference](/docs/ssr-apis/)

In a generic plugin the `gatsby-node.js` file enables the use of [gatsby node APIs](/docs/node-apis/) which is where all the processes like createPage,createResolvers,sourceNodes exist.

In this file you are able to carry out functions that load API keys, send calls to APIs,create Gatsby-nodes using the API response, Create pages to display responses and loop through responses to display an individual response. (A good use case of this would be a plugin that gets data from an API.)
An example of a source node would look like this:

```JavaScript
export.sourceNodes = ({ actions,createNodeID,createContentDigest})=>{
  const nodeData = {
    title : "Test Node",
    description:"Testing the node "
  }
  const newNode = {
    ...nodeData,
    id: createNodeId("TestNode-testid")
    internal :{
      type: "TestNode"
      contentDigest: createContentDigest(nodeData),
    },
  }
  actions.creatNode(newNode)
}
```

Restarting the server will make the `allTestNode` query available at `localhost:8000/___graphql`

> Libraries like [Axios](https://www.npmjs.com/package/axios) can be used to handle calls in the `gatsby-node.js` file

As seen in the [naming a plugin](/docs/naming-a-plugin/) section, the function of the plugin is shown in the naming format. However, they all have the same structure.
