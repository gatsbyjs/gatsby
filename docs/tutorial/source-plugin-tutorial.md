---
title: "Creating a Source Plugin"
---

In this tutorial you'll create your own source plugin. Your plugin will source data from a local API, which will source data, optimize remote images, and create foreign key relationships between data pulled by your plugin.

## What is a source plugin?

Source plugins "source" data from remote or local locations into what Gatsby calls [nodes](/docs/node-interface/). This tutorial uses a demo API so that you can see how the data works on both frontend and backend, but the same principles apply if you would like to source data from another API.

For more background on source plugins, check out [Gatsby's source plugin documentation](/docs/creating-a-source-plugin/)

## Why create a source plugin?

Source plugins convert data from any source into a format that can be processed by Gatsby. Your Gatsby site could use several source plugins to combine data in interesting ways.

There may not be [an existing plugin](/plugins/?=gatsby-source) for your data source, so you can create your own.

_**NOTE:** if your data is local i.e. on your file system and part of your site's repo, then you generally don't want to create a new source plugin. Instead you want to use [gatsby-source-filesystem](/packages/gatsby-source-filesystem/) which handles reading and watching files for you. You can then use [transformer plugins](/plugins/?=gatsby-transformer) like [gatsby-transformer-yaml](/packages/gatsby-transformer-yaml/) to make queryable data from files._

## How to create a source plugin

### Overview

Your plugin will source blog posts and authors from the demo API, link the posts and authors, and take image URLs from the posts and optimize them automatically. You'll be able to configure your plugin in your site's `gatsby-config.js` file and write GraphQL queries to access your plugin's data.

The code for this tutorial can be referenced from [its place in the examples folder of the Gatsby repository](https://github.com/gatsbyjs/gatsby/tree/master/examples/creating-source-plugins). You can clone this code and delete the `source-plugin` and `example-site` folders to follow along.

#### An example API request

To see the API in action you can run it locally by navigating into the `api` folder, installing dependencies with `npm install`, and starting the server with `npm start`. You will then be able to navigate to a GraphQL playground running at `http://localhost:4000`. If you paste the following query into the left side of the window and press the play button you should see data for posts with their IDs and descriptions returned:

```graphql
query {
  posts {
    id
    description
  }
}
```

This data is an example of the data you will with your plugin.

_You can also see a running version of the GraphQL playground associated with a distinct API at [https://gatsby-source-plugin-api.glitch.me/](https://gatsby-source-plugin-api.glitch.me/), which is running the `api` folder in a Glitch project, like you would when you run `npm start` on your own computer._

#### Plugin behavior

Your plugin will have the following behavior:

- Make an API request to the demo API
- Convert the data in the API response to Gatsby's node system
- Link the nodes together so you can query for an author on each post
- Accept plugin options to customize how your plugin works
- Optimize images from Unsplash URLs so they can be used with `gatsby-image`

### Setup

You'll need to setup an example site and create a plugin inside it to begin building.

#### Setup an example site

Create a new Gatsby site with the `gatsby new` command, based on the hello world starter.

```shell
gatsby new example-site https://github.com/gatsbyjs/gatsby-starter-hello-world
```

This site will install your plugin, which gives you a place to test the code for your plugin.

#### Setup a source plugin

Create a new Gatsby plugin with the `gatsby new` command, based on the plugin starter.

```shell
gatsby new source-plugin https://github.com/gatsbyjs/gatsby-starter-plugin
```

This will create your plugin in a separate project than your example site, but you could also include it in your [site's `plugins` folder](/docs/loading-plugins-from-your-local-plugins-folder/).

Your plugin starts with a few files from the starter, which can be seen in the snippet below:

```text
/example-site
/source-plugin
├── .gitignore
├── gatsby-browser.js
├── gatsby-node.js
├── gatsby-ssr.js
├── index.js
├── package.json
└── README.md
```

The file where all the logic will live is in the **`gatsby-node.js`**. This file is where Gatsby expects to find any usage of the [Gatsby Node APIs](https://www.gatsbyjs.org/docs/node-apis/). These allow customization/extension of default Gatsby settings affecting pieces of the site build process. This file is where all the logic for sourcing data will live.

#### Install your plugin in the example site

You need to install your plugin in the site to be able to test that your code is running. Open up the `gatsby-config.js` file in the `example-site` and [add your plugin using `require.resolve`](/docs/creating-a-local-plugin/#using-requireresolve-and-a-filepath).

```javascript:title=example-site/gatsby-config.js
module.exports = {
  plugins: [require.resolve(`../source-plugin`)],
}
```

_You can include the plugin by using solely its name if you are using [npm link or yarn workspaces](/docs/creating-a-local-plugin/#using-npm-link-or-yarn-link) or place your `source-plugin` in [`example-site/plugins`](/docs/creating-a-local-plugin/) instead of being in a folder a step above._

You can now navigate into the `example-site` folder and run `gatsby develop`. You should see a line in the output in the terminal that shows your plugin loaded:

```text
$ gatsby develop
success open and validate gatsby-configs - 0.033s
success load plugins - 0.074s
Loaded gatsby-starter-plugin // highlight-line
success onPreInit - 0.016s
...
```

If you open your `gatsby-node.js` file you will see the `console.log` that is resulting in the output in the terminal.

```javascript:title=source-plugin/gatsby-node.js
exports.onPreInit = () => console.log("Loaded gatsby-starter-plugin")
```

### Source data and create nodes

Data is sourced in the `gatsby-node.js` file of source plugins or Gatsby sites. Specifically, it's done by calling a Gatsby function called `createNode` inside of the `sourceNodes` API in the `gatsby-node.js` file.

#### Create nodes inside of `sourceNodes` with the `createNode` function

Open up the `gatsby-node.js` file in the `source-plugin` and add the following code to create nodes from a hardcoded array of data :

```javascript:title=source-plugin/gatsby-node.js
// constants for your GraphQL Post and Author types
const POST_NODE_TYPE = `Post`

exports.sourceNodes = async ({
  actions,
  createContentDigest,
  createNodeId,
  getNodesByType,
}) => {
  const { createNode } = actions

  const data = {
    posts: [
      { id: 1, description: `Hello world!` },
      { id: 2, description: `Second post!` },
    ],
  }

  // loop through data and create Gatsby nodes
  data.posts.forEach(post =>
    createNode({
      ...post,
      id: createNodeId(`${POST_NODE_TYPE}-${post.id}`),
      parent: null,
      children: [],
      internal: {
        type: POST_NODE_TYPE,
        content: JSON.stringify(post),
        contentDigest: createContentDigest(post),
      },
    })
  )

  return
}
```

This code creates Gatsby node's that are queryable in a site. To the following steps break down what is happening in the code:

- you implemented Gatsby's [`sourceNodes` API](/docs/node-apis/#sourceNodes) which Gatsby will run as part of its bootstrap process, and pulled out some Gatsby helpers (like `createContentDigest` and `createNodeId`) to facilitate creating nodes

```javascript:title=source-plugin/gatsby-node.js
// constants for your GraphQL Post and Author types
const POST_NODE_TYPE = `Post`

exports.sourceNodes = async ({
  actions,
  createContentDigest,
  createNodeId,
  getNodesByType,
}) => {
  const { createNode } = actions

  // ... sample code removed here for brevity (it is shown below)

  return
}
```

- then you stored some data in an array and looped through it, calling `createNode` on each post in the array

```javascript:title=source-plugin/gatsby-node.js
// constants for your GraphQL Post and Author types
const POST_NODE_TYPE = `Post`

exports.sourceNodes = async ({
  actions,
  createContentDigest,
  createNodeId,
  getNodesByType,
}) => {
  const { createNode } = actions

  // highlight-start
  const data = {
    posts: [
      { id: 1, description: `Hello world!` },
      { id: 2, description: `Second post!` },
    ],
  }

  // loop through data and create Gatsby nodes
  data.posts.forEach(post =>
    createNode({
      ...post,
      id: createNodeId(`${POST_NODE_TYPE}-${post.id}`),
      parent: null,
      children: [],
      internal: {
        type: POST_NODE_TYPE,
        content: JSON.stringify(post),
        contentDigest: createContentDigest(post),
      },
    })
  )
  // highlight-end

  return
}
```

If you run the `example-site` with `gatsby develop`, you can now open up `http://localhost:8000/___graphql` and query your posts with this query:

```graphql
query {
  allPost {
    nodes {
      id
      description
    }
  }
}
```

The problem with this data is that it is _not coming from the API_, it is hardcoded into an array. The declaration of the `data` array needs to be updated to pull data from a different location.

### Querying and sourcing data from a remote location

You can query data from any location using functions and libraries like Node.js's built-in `http.get`, `axios`, or `node-fetch`. This tutorial uses a GraphQL client so that the source plugin can support GraphQL subscriptions when it fetches data from the demo API, and can proactively update your data in the site when information on the API changes.

#### Adding dependencies

You'll use several modules from npm to making fetching data with GraphQL easier. Install them with:

```shell
npm install apollo-cache-inmemory apollo-client apollo-link apollo-link-http apollo-link-ws apollo-utilities graphql graphql-tag node-fetch ws
```

The libraries used here are specifically chosen so that the source plugin can support GraphQL subscriptions.

Open your `package.json` file after installation and you'll see the packages have been added to a `dependencies` section at the end of the file.

#### Configure an Apollo client to fetch data

Import the handful of Apollo packages that you installed that help setup an Apollo client in your plugin:

```javascript:title=source-plugin/gatsby-node.js
// highlight-start
const { ApolloClient } = require("apollo-client")
const { InMemoryCache } = require("apollo-cache-inmemory")
const { split } = require("apollo-link")
const { HttpLink } = require("apollo-link-http")
const { WebSocketLink } = require("apollo-link-ws")
const { getMainDefinition } = require("apollo-utilities")
const fetch = require("node-fetch")
const gql = require("graphql-tag")
const WebSocket = require("ws")
// highlight-end

const POST_NODE_TYPE = `Post`

exports.sourceNodes = async ({
// ...
```

Then you can copy this code that sets up the necessary pieces of the Apollo client and paste it after your imports:

```javascript:title=source-plugin/gatsby-node.js
// ... imports
const WebSocket = require("ws")

const POST_NODE_TYPE = `Post`

// highlight-start
const client = new ApolloClient({
  link: split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      )
    },
    new WebSocketLink({
      uri: `ws://localhost:4000`, // or `ws://gatsby-source-plugin-api.glitch.me/`
      options: {
        reconnect: true,
      },
      webSocketImpl: WebSocket,
    }),
    new HttpLink({
      uri: "http://localhost:4000", // or `https://gatsby-source-plugin-api.glitch.me/`
      fetch,
    })
  ),
  cache: new InMemoryCache(),
})
// highlight-end

exports.sourceNodes = async ({
// ...
```

You can read about each of the packages that are working together in [Apollo's docs](https://www.apollographql.com/docs/react/), but the end result is creating a `client` that you can use to call methods like `query` on to get data from the source it's configured to work with. In this case, that is `localhost:4000` where you should have the API running. If you can't configure the API to run locally, you can update the URLs for the client to use `gatsby-source-plugin-api.glitch.me` where a version of the API is deployed, instead of `localhost:4000`.

#### Query data from the API

Now you can replace the hardcoded data in the `sourceNodes` function with a GraphQL query:

```diff:title=source-plugin/gatsby-node.js
  exports.sourceNodes = async ({
    actions,
    createContentDigest,
    createNodeId,
    getNodesByType,
  }) => {
    const { createNode, touchNode, deleteNode } = actions

-   const data = {
-     posts: [
-       { id: 1, description: `Hello world!` },
-       { id: 2, description: `Second post!` },
-     ],
-   }
+   const { data } = await client.query({
+     query: gql`
+       query {
+         posts {
+           id
+           description
+         }
+       }
+     `,
+   })

    // ...
```

Now you're creating nodes based on data coming from the API, neat! However, only the `id` and `description` fields are coming back from the API and being saved to each node, so add the rest of the fields to the query so that there will be the same data available to Gatsby.

This is also a good time to add data to your query so that it also returns authors.

```javascript:title=source-plugin/gatsby-node.js
const { data } = await client.query({
  query: gql`
    query {
      posts {
        id
        description
        // highlight-start
        slug
        imgUrl
        imgAlt
        author {
          id
          name
        }
      }
      authors {
        id
        name
      }
      // highlight-end
    }
  `,
})
```

With the new data, you can also loop through the authors to create Gatsby nodes from them by adding another loop to `sourceNodes`:

```javascript:title=source-plugin/gatsby-node.js
const POST_NODE_TYPE = `Post`
const AUTHOR_NODE_TYPE = `Author` // highlight-line

exports.sourceNodes = async ({
  actions,
  createContentDigest,
  createNodeId,
  getNodesByType,
}) => {
  const { createNode, touchNode, deleteNode } = actions

  const { data } = await client.query({
    query: gql`
      query {
        posts {
          id
          slug
          description
          imgUrl
          imgAlt
          author {
            id
            name
          }
        }
        authors {
          id
          name
        }
      }
    `,
  })

  // loop through data returned from the api and create Gatsby nodes for them
  data.posts.forEach(post =>
    createNode({
      ...post,
      id: createNodeId(`${POST_NODE_TYPE}-${post.id}`), // hashes the inputs into an ID
      parent: null,
      children: [],
      internal: {
        type: POST_NODE_TYPE,
        content: JSON.stringify(post),
        contentDigest: createContentDigest(post),
      },
    })
  )
  // highlight-start
  data.authors.forEach(author =>
    createNode({
      ...author,
      id: createNodeId(`${AUTHOR_NODE_TYPE}-${author.id}`), // hashes the inputs into an ID
      parent: null,
      children: [],
      internal: {
        type: AUTHOR_NODE_TYPE,
        content: JSON.stringify(author),
        contentDigest: createContentDigest(author),
      },
    })
  )
  // highlight-end

  return
}
```
