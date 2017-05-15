---
title: Node Interface
---

The "node" is the center of Gatsby's data system. All data that's
added to Gatsby is modeled using nodes.

The basic node data structure is as follows:

```flow
id: String,
children: Array[String],
parent: String,
internal: {
  contentDigest: String,
  mediaType: String,
  type: String,
  pluginName: String,
  content: String,
}
...other node type specific fields
```

## Source plugins

New nodes are added to Gatsby by "source" plugins. A common one that many
Gatsby sites use is the [Filesystem source
plugin](/docs/packages/gatsby-source-filesystem/) which turns files on disk
into File nodes.

Other source plugins pull data from external APIs such as the [Drupal](/docs/packages/gatsby-source-drupal/) and
[Hacker News](/docs/packages/gatsby-source-hacker-news/)

## Transformer plugins

Transformer plugins transform source nodes into new types of nodes. It is very
common when building Gatsby sites to install both source plugin(s) and transformer
plugins.

Nodes created by transformer plugins are set as "children" of their "parent"
nodes.

* The [Remark
(Markdown library) transformer
plugin](/docs/packages/gatsby-transformer-remark/) looks for new nodes that
are created with a `mediaType` of `text/x-markdown` and then transforms these
nodes into `MarkdownRemark` nodes with an `html` field.
* The [YAML transformer plugin](/docs/packages/gatsby-transformer-yaml/) looks
for new nodes with a media type of `text/yaml` (e.g. a `.yaml` file) and creates new
YAML child node(s) by parsing the YAML source into JavaScript objects.

## GraphQL

Gatsby automatically infers the structure of your site's nodes and creates
a GraphQL schema which you can then query from your site's components.
