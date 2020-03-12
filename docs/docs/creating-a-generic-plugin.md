---
title: Creating a Generic plugin
---

This section is aimed at explaining the structure of a gatsby plugin and the files that are needed to create it.

As seen in the [what is a plugin doc](/docs/what-is-a-plugin/),a plugin is a piece of software that acts as an add-on and gives your site additional functionality.

They contain a file, usually in the project root, called `package.json` - this file holds various metadata relevant to the project. This file is used to give information to npm that allows it to identify the project as well as handle the project's dependencies.

The process of initializing a `package.json` in a project is done by running :

```shell
  npm init
```

After running the above command a series of options are listed in the CLI interface and the options are stored in your `package.json` which contain some [files Gatsby looks for in a Plugin](/docs/files-gatsby-looks-for-in-a-plugin.md)

### What happens in a Generic Plugin ?

In a generic plugin the `gatsby-node.js` file enables the use of [gatsby node APIs](/docs/node-apis/) which is where all the processes like createPage,createResolvers,sourceNodes exist.

In this file you are able to carry out functions that load API keys, send calls to APIs, create Gatsby-nodes using the API response, create pages to display responses, and loop through responses to display an individual response (a good use case of this would be a plugin that gets data from an API).

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
