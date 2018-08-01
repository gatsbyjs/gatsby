---
title: "Source Plugin Tutorial"
---

Creating your own source plugin.

## What this tutorial covers

In this tutorial you'll create your own source plugin. Your plugin will source data from [pixabay.com](https://pixabay.com) allowing you to add Pixabay images to any Gatsby site.

## What is a source plugin?

Source plugins "source" data from remote or local locations into what Gatsby calls [nodes](/docs/node-interface/).

For more background on source plugins, check out [Gatsby's source plugin documentation](/docs/create-source-plugin/)

## Why create a source plugin?

Source plugins convert data from any source into a format that can be processed by Gatsby. Your Gatsby site could use several source plugins to combine data in interesting ways.

If you can't find a plugin for your data source you can create your own.

## How to create a source plugin

### Overview

Your plugin is going to source images from Pixabay. You'll be able to configure your plugin in your site's `gatsby-config.js` file and write GraphQL queries to access your plugin's data.

> **NOTE:** You'll need a Pixabay API key which you can get by [registering for a Pixabay account](https://pixabay.com/en/accounts/register/). Your API key is in the [“Search Images” section of the Pixabay API docs](https://pixabay.com/api/docs/#api_search_images).

### An example API request

Pixabay's [API documentation](https://pixabay.com/api/docs/#api_search_images) describes how their API works. Here's an example that uses a few options to search for photos:

`https://pixabay.com/api/?q=yellow+flowers&editors_choice=true&pretty=true&key=<YOUR_API_KEY_HERE>`

Take the above URL and paste it in to a browser to see Pixabay's response to your query. It gives you a list of photos matching the query "yellow flowers" that have received an Editor's Choice award.

> **NOTE:** You should replace `<YOUR_API_KEY_HERE>` with your Pixabay API key.

### Plugin behavior

Your plugin will have the following behavior:

- Accept config options like a Pixabay API key and a search query
- Make an API request using the provided config options
- Convert the data in the API response to Gatsby's node system

### Setup a new Gatsby site

Create a new Gatsby project and change directories into the new project you just created.

```shell
gatsby new source-tutorial-site https://github.com/gatsbyjs/gatsby-starter-default#v2
cd source-tutorial-site
```

You're going to build your plugin as a "local" plugin that only exists for your project. Later on you'll learn how to publish a plugin to [npm](https://npmjs.com) so anyone can use it, but for now create a `plugins` directory and change into that directory:

```shell
mkdir plugins
cd plugins
```

### Create a `plugins` folder

The bare essentials of a plugin are a directory named after your plugin, which contains a `package.json` file and a `gatsby-node.js` file:

```
|-- plugins
    |-- gatsby-source-pixabay
        |-- gatsby-node.js
        |-- package.json
```

Start by creating the directory and changing into it:

```
mkdir gatsby-source-pixabay
cd gatsby-source-pixabay
```

### Create a `package.json` file

Now create a `package.json` file, this describes your plugin and any third-party code it might depend on. `npm` has a command to create this file for you. Run:

```shell
npm init --yes
```

to create the file using default options.

> **NOTE:** You can omit `--yes` if you'd like to specify the options yourself.

### Add dependencies

You'll use a couple of modules from npm to add some helper functionality. Install them with:

```shell
npm install node-fetch query-string --save
```

Open your `package.json` file and you'll see `node-fetch` and `query-string` have been added to a `dependencies` section at the end:

```js
  "dependencies": {
    "node-fetch": "^2.1.2",
    "query-string": "^6.0.0"
  }
```

With the setup done, move on to adding the plugin's functionality.

### Create a `gatsby-node.js` file

Create a new file called `gatsby-node.js` in your `gatsby-source-pixabay` directory, and add the following:

```js
const crypto = require("crypto")
const fetch = require("node-fetch")
const queryString = require("query-string")

exports.sourceNodes = ({ actions, createNodeId }, configOptions) => {
  const { createNode } = actions

  // Gatsby adds a configOption that's not needed for this plugin, delete it
  delete configOptions.plugins

  // plugin code goes here...
  console.log("Testing my plugin", configOptions)
}
```

### Step by step through your `gatsby-node.js` file

What did you do by adding this code? You started by importing the dependencies that you added earlier (along with one built in dependency):

```js
const crypto = require("crypto")
const fetch = require("node-fetch")
const queryString = require("query-string")
```

Then you implemented Gatsby's [`sourceNodes` API](/docs/node-apis/#sourceNodes) which Gatsby will run as part of its bootstrap process. When Gatsby calls `sourceNodes`, it'll pass in some helper functions (`actions` and `createNodeId`) along with any config options that are provided in your project's `gatsby-config.js` file:

```js
exports.sourceNodes = (
  { actions, createNodeId },
  configOptions
) => {
```

You do some initial setup:

```js
const { createNode } = actions

// Gatsby adds a configOption that's not needed for this plugin, delete it
delete configOptions.plugins
```

And finally add a placeholder message:

```js
// plugin code goes here...
console.log("Testing my plugin", configOptions)
```

### Add the plugin to your site

The skeleton of your plugin is in place which means you can add it to your project and check your progress so far.

Open `gatsby-config.js` from the root directory of your tutorial site, and add the `gatsby-source-pixabay` plugin:

```js
module.exports = {
  siteMetadata: {
    title: "Gatsby Default Starter",
  },
  plugins: [
    "gatsby-plugin-react-helmet",
    {
      resolve: "gatsby-source-pixabay",
      options: {
        key: "<YOUR_API_KEY_HERE>",
        q: "yellow flowers",
      },
    },
  ],
}
```

Open a new terminal in the root directory of your tutorial site, then start Gatsby's development mode:

```shell
gatsby develop
```

Check the lines after `success on PreBootstrap`, you should see your "Testing my plugin" message along with the `key` from your `gatsby-config.js` file:

```shell
success onPreBootstrap — 0.048 s
⠁ Testing my plugin { key: '<YOUR_API_KEY_HERE>' }
warning The gatsby-source-pixabay plugin has generated no Gatsby nodes. Do you need it?
success source and transform nodes — 0.057 s
```

Note that Gatsby is warning that your plugin doesn't do anything yet. Time to fix that.

### Fetch remote data from Pixabay

Update `gatsby-node.js` in your `plugins/gatsby-source-pixabay/` directory:

```js{14-32}
const fetch = require('node-fetch')
const queryString = require('query-string')
const crypto = require('crypto')

exports.sourceNodes = (
  { actions, createNodeId },
  configOptions
) => {
  const { createNode } = actions

  // Gatsby adds a configOption that's not needed for this plugin, delete it
  delete configOptions.plugins

  // Convert the options object into a query string
  const apiOptions = queryString.stringify(configOptions)

  // Join apiOptions with the Pixabay API URL
  const apiUrl = `https://pixabay.com/api/?${apiOptions}`

  // Gatsby expects sourceNodes to return a promise
  return (
    // Fetch a response from the apiUrl
    fetch(apiUrl)
      // Parse the response as JSON
      .then(response => response.json())
      // Process the JSON data into a node
      .then(data => {
        // For each query result (or 'hit')
        data.hits.forEach(photo => {
          console.log("Photo data is:", photo)
        })
      })
  )
}
```

You've added code that fetches photo data from the Pixabay API. For now, your plugin logs that data but doesn't do anything else. Check that you can see the logged photo data by restarting `gatsby develop`. This time you should see a series of results like:

```shell
success onPreBootstrap — 0.035 s
⠠ source and transform nodesresponse Response { size: 0, timeout: 0 }
Photo data is: { largeImageURL: 'https://pixabay.com/get/ea36b70d29fd073ed1584d05fb1d4e9ee570e4d510ac104497f5c071a3efb6bd_1280.jpg',
  webformatHeight: 426,
  webformatWidth: 640,
  likes: 17,
  imageWidth: 5184,
  id: 3362196,
  user_id: 5598375,
  views: 263,
  comments: 24,
  pageURL: 'https://pixabay.com/en/dandelion-flower-yellow-nature-3362196/',
  imageHeight: 3456,

  ...(more data follows)...
```

You're ready to add the final step of your plugin - converting this data into a Gatsby node.

### Use `createNode` function

You're adding a helper function on lines 15 to 35 and processing the data into a node on lines 52 to 55:

```js{15-35,52-55}
const fetch = require('node-fetch')
const queryString = require('query-string')
const crypto = require('crypto')

exports.sourceNodes = (
  { boundActionCreators, createNodeId },
  configOptions
) => {
  const { createNode } = boundActionCreators

  // Gatsby adds a configOption that's not needed for this plugin, delete it
  delete configOptions.plugins

  // Helper function that processes a photo to match Gatsby's node structure
  const processPhoto = photo => {
    const nodeId = createNodeId(`pixabay-photo-${photo.id}`)
    const nodeContent = JSON.stringify(photo)
    const nodeContentDigest = crypto
      .createHash('md5')
      .update(nodeContent)
      .digest('hex')

    const nodeData = Object.assign({}, photo, {
      id: nodeId,
      parent: null,
      children: [],
      internal: {
        type: `PixabayPhoto`,
        content: nodeContent,
        contentDigest: nodeContentDigest,
      },
    })

    return nodeData
  }

  // Convert the options object into a query string
  const apiOptions = queryString.stringify(configOptions)

  // Join apiOptions with the Pixabay API URL
  const apiUrl = `https://pixabay.com/api/?${apiOptions}`

  // Gatsby expects sourceNodes to return a promise
  return (
    // Fetch a response from the apiUrl
    fetch(apiUrl)
      // Parse the response as JSON
      .then(response => response.json())
      // Process the response data into a node
      .then(data => {
        // For each query result (or 'hit')
        data.hits.forEach(photo => {
          // Process the photo data to match the structure of a Gatsby node
          const nodeData = processPhoto(photo)
          // Use Gatsby's createNode helper to create a node from the node data
          createNode(nodeData)
        })
      })
  )
}
```

### Query for results

Your plugin is ready. Restart `gatsby develop` and open a browser at [http://localhost:8000/\_\_\_graphql](http://localhost:8000/___graphql). The Pixabay data can be queried from here. try:

```graphql
{
  allPixabayPhoto(limit: 10) {
    edges {
      node {
        largeImageURL
        pageURL
        tags
        user
      }
    }
  }
}
```

Or [open the query from this link](<http://localhost:8000/___graphql?query=%7B%0A%20%20allPixabayPhoto(limit%3A%2010)%20%7B%0A%20%20%20%20edges%20%7B%0A%20%20%20%20%20%20node%20%7B%0A%20%20%20%20%20%20%20%20largeImageURL%0A%20%20%20%20%20%20%20%20pageURL%0A%20%20%20%20%20%20%20%20tags%0A%20%20%20%20%20%20%20%20user%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%0A>).

Experiment with different options in your `gatsby-config.js` file to see how that affects your query results. The [Pixabay API docs](https://pixabay.com/api/docs/#api_search_images) might be a useful reference.

## Publishing a plugin

You've built a local plugin for your project, but what if you want to share it with others? `npm` allows you to publish your plugins. Check out the npm docs on [How to Publish & Update a Package](https://docs.npmjs.com/getting-started/publishing-npm-packages) for more info.

> **NOTE:** Don't forget to edit your plugin's `package.json` file to include info about your plugin.

## Summary

You've written a local Gatsby plugin that:

- can be configured with an entry in your `gatsby-config.js` file
- requests data from a third-party API
- pulls the API data into Gatsby's node system
- allows the data to be queried with GraphQL

Congratulations!

## Where next?

Your plugin has been adapted from Jason Lengstorf's [gatsby-source-pixabay plugin](https://www.npmjs.com/package/gatsby-source-pixabay). Check out [the source on GitHub](https://github.com/jlengstorf/gatsby-source-pixabay).

Try adding new features to your plugin, for example - download images from Pixabay, improve error handling, add documentation or automated tests.

Check out Gatsby's docs on [plugin authoring](/docs/plugin-authoring/) and [creating a source plugin](/docs/create-source-plugin).

### A note on JavaScript versions

In this tutorial you've written code in a version of JavaScript that's compatible with Node.js version 6 and above.

Jason's version of [the plugin](https://github.com/jlengstorf/gatsby-source-pixabay/blob/master/src/gatsby-node.js) uses newer JavaScript features with [babel](https://babeljs.io/) to provide compatibility for older versions of Node. Compare your code with Jason's to see how newer JavaScript features allow for more succinct code.
