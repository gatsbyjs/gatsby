---
title: Create a Transformer Plugin
---

There are two types of plugins that work within Gatsby's data system, "source"
and "transformer" plugins.

- **Source** plugins "source" data from remote or local locations into what
  Gatsby calls [nodes](/docs/node-interface/).
- **Transformer** plugins "transform" data provided by source plugins into new
  nodes and/or node fields.

This doc is concerned with transformer plugins.

## Transformer plugin example

The [`gatsby-transformer-remark`](/packages/gatsby-transformer-remark/) plugin "transforms" markdown nodes (fetched for example from the filesystem source plugin) into html and provides additional node details such as for example the `timeToRead` the `tableOfContents` and the `excerpt`.

## What do transformer plugins do?

Each transformer plugin is responsible for "enhancing" the existing source nodes they are provided to provide additional information. Therefore, you'll often use both source plugins and transformer plugins in your Gatsby sites.

This loose coupling between the data source and transformer plugins allow Gatsby site builders to quickly assemble complex data transformation pipelines with
little work.

## What does the code look like?

Just like a source plugin, a transformer plugin is a normal NPM package. It has a `package.json` file with optional dependencies as well as a `gatsby-node.js` file where you implement Gatsby's Node.js APIs.

As an example, let's take a look at `gatsby-transformer-yaml`. This transformer plugin looks for new nodes with a media type of text/yaml (e.g. a .yaml file) and creates new YAML child node(s) by parsing the YAML source into JavaScript objects.

Let's say we have an example YAML file that looks like this:

```yaml:title=src/data/example.yml
- id: Jane Doe
  bio: Developer based in Somewhere, USA
- id: John Smith
  bio: Developer based in Maintown, USA
```

First, we make sure the file is sourced, using `gatsby-source-filesystem` in `gatsby-config.js`:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `./src/data/`,
      },
    },
  ],
}
```

Now if we query `allFile`...

```graphql
query {
  allFile {
    edges {
      node {
        internal {
          type
          mediaType
          description
          owner
        }
      }
    }
  }
}
```

... We see we have the sourced file.

```json
{
  "data": {
    "allFile": {
      "edges": [
        {
          "node": {
            "internal": {
              "contentDigest": "c1644b03f380bc5508456ce91faf0c08",
              "type": "File",
              "mediaType": "text/yaml",
              "description": "File \"src/data/example.yml\"",
              "owner": "gatsby-source-filesystem"
            }
          }
        }
      ]
    }
  }
}
```

## Using the cache

Sometimes transforming properties costs time and resources. In order to avoid recreating these properties at each run, you can profit from the global cache mechanism Gatsby provides.

Cache keys should at least contain the contentDigest of the concerned. For example, the `gatsby-transformer-remark` uses the following cache key for the html node:

```javascript:title=extend-node-type.js
const htmlCacheKey = node =>
  `transformer-remark-markdown-html-${
    node.internal.contentDigest
  }-${pluginsCacheStr}-${pathPrefixCacheStr}`
```

Accessing and setting content in the cache is as simple as:

```javascript:title=extend-node-type.js
const cachedHTML = await cache.get(htmlCacheKey(markdownNode))

cache.set(htmlCacheKey(markdownNode), html)
```
