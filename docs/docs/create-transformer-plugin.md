---
title: Create a Transformer Plugin
---

Transformer plugins are responsible for "transforming" data provided by
[source plugins](/docs/create-source-plugin) into new nodes and/or node fields.

## Transformer plugin example

The [`gatsby-transformer-remark`](/packages/gatsby-transformer-remark/) plugin
"transforms" markdown nodes (fetched for example from the filesystem source plugin) into html and provides additional node details such as for example the `timeToRead` the `tableOfContents` and the `excerpt`.

## What do transformer plugins do?

Each transformer plugin is responsible for "enhancing" the existing source nodes they
are provided to provide additional information. Therefore, you'll often use both source plugins and transformer plugins in your Gatsby sites.

This loose coupling between the data source and transformer plugins allow Gatsby
site builders to quickly assemble complex data transformation pipelines with
little work.

## What does the code look like?

Just like a source plugin, a transformer plugin is a normal NPM package. It has a `package.json` file with optional
dependencies as well as a `gatsby-node.js` file where you implement Gatsby's Node.js
APIs. Transformer plugins make use of the `setFieldsOnGraphQLNodeType` function and they commonly provide this functionality in the `extend-node-type` file.

Your `gatsby-node.js` should look something like:

```javascript:title=gatsby-node.js
exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`)
```

Information on the purpose of this function can be found in the [API reference](/docs/node-apis/#setFieldsOnGraphQLNodeType).

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
