---
title: Creating a Generic plugin
---

This section is aimed at explaining the structure of a Gatsby plugin and the files that are needed to create it.

As seen in the [what is a plugin doc](/docs/what-is-a-plugin/),a plugin is a piece of software that acts as an add-on and gives your site additional functionality.

They contain a file, usually in the project root, called `package.json` - this file holds various metadata relevant to the project. This file is used to give information to npm that allows it to identify the project as well as handle the project's dependencies.

The process of initializing a `package.json` in a project is done by running :

```shell
  npm init
```

After running the above command a series of options are listed in the CLI interface and those you select are stored in your `package.json` which contain some [files Gatsby looks for in a Plugin](/docs/files-gatsby-looks-for-in-a-plugin.md)

### What happens in a Generic Plugin ?

In a generic plugin the `gatsby-node.js` file enables the use of [gatsby node APIs](/docs/node-apis/) such as `createPage`, `createResolvers`, and `sourceNodes`.

In `gatsby-node.js` you are able to carry out functions with APIs such as:

- Loading API keys
- Sending calls to APIs
- Creating Gatsby-nodes using the API response
- Creating Individual pages from nodes

> A good use case of the above would be a plugin that gets data from an API.

[sourceNodes](/docs/node-apis/#sourceNodes) is a life-cycle API that a plugin can use to create Nodes. A Node is the smallest unit of data in Gatsby. Nodes are created using the [createNode](/docs/actions/#createNode) action.

An example of how a sourceNode would be implemented is shown below :

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

The above code block creates a node called "Test Node " as seen from the `title` parameter. If this process is successful restarting the server will make the `allTestNode` query available at `localhost:8000/___graphql`.

> Libraries like [Axios](https://www.npmjs.com/package/axios) can be used to handle calls in the `gatsby-node.js` file

Though all plugins have the same structure, their name signals what functionality they provide. See the [naming a plugin](/docs/naming-a-plugin) section for more information.
