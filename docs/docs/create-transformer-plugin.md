---
title: Create a Transformer Plugin
---

Transformer plugins are responsible for "transforming" data data provided by
[source plugins](/docs/create-source-plugin) into new nodes and/or node fields

For example:

The [`gatsby-transform-remark`](/packages/gatsby-transform-remark/) plugin
"transforms" markdown nodes (fetched for example from the filesystem source plugin) into html and provides additional node details such as for example the `timeToRead` the `tableOfContents` and the `excerpt`.

Each transformer plugin is responsible for "enhancing" the existing source nodes they
are provided in order to provide additional information. This way, source and transformer plugins can work together easily. Transformer plugins can be heavily opinionated since they chose they way they transform their source.

This loose coupling between data source and transformer plugins allow Gatsby
site builders to quickly assemble complex data transformation pipelines with
little work on their (and your (the transformer plugin author)) part.

What does the code look like?

Just as the source plugins they are normal NPM package. It has a package.json with optional
dependencies as well as a `gatsby-node.js` where you implement Gatsby's Node.js
APIs. Transformer plugins make use of the `setFieldsOnGraphQLNodeType` function and they commonly provide this functionnality in the `extend-node-type` file.

Your `gatsby-node.js` should look something like:

```javascript
exports.setFieldsOnGraphQLNodeType = require(`./extend-node-type`)
```

Information on the purpose of this function can be found at the [API reference](docs/node-apis/#setFieldsOnGraphQLNodeType)

## Using the cache

Sometimes transforming properties costs time and resources and in order to avoid recreating these properties at each run you can profit from the global cache mechanism Gatsby provides.

Cache keys should at least contain an explicit name of the plugin, the contentDigest of the concerned node and the property it caches. For example the `gatsby-transformer-remark` uses the following cache key for the html node:

```javascript
const htmlCacheKey = node =>
  `transformer-remark-markdown-html-${
    node.internal.contentDigest
  }-${pluginsCacheStr}-${pathPrefixCacheStr}`
```

Accessing and setting content in the cache is as simple as:

```javascript
const cachedHTML = await cache.get(htmlCacheKey(markdownNode))

cache.set(htmlCacheKey(markdownNode), html)
```
