---
title: Node Interface
---

The "node" is the center of Gatsby's data system. All data that's added to
Gatsby is modeled using nodes.

## Node data structure

The basic node data structure is as follows:

```ts
interface Node {
  id: string
  children?: Array<string>
  parent?: string
  fields: object
  internal: {
    contentDigest: string
    mediaType?: string
    type: string
    owner: string
    fieldOwners: object
    content?: string
    description?: string
  }
  [key: string]: unknown // ...other fields specific to this type of node
}
```

### `parent`

A key reserved for plugins who wish to extend other nodes.

### `contentDigest`

A digest "Hash", or short digital summary, of the content of this node (for example, `md5sum`).

The digest should be unique to the content of this node since it's used for caching. If the content changes, this digest should also change. There's a helper function called [createContentDigest](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-core-utils/src/create-content-digest.ts) to create an `md5` digest.

### `mediaType`

Optional [media type](https://en.wikipedia.org/wiki/Media_type) to indicate to transformer plugins this node has data they can further process.

### `type`

A globally unique node type chosen by the plugin owner.

### `owner`

The plugin which created this node. This field is added by gatsby itself (and not the plugin).

### `fieldOwners`

Stores which plugins created which fields. This field is added by gatsby itself (and not the plugin).

### `content`

Optional field exposing the raw content for this node that transformer plugins can take and further process.

### `description`

Text description of the node.

## Source plugins

New nodes are added to Gatsby by "source" plugins. A common one that many Gatsby
sites use is the [Filesystem source plugin](/plugins/gatsby-source-filesystem/)
which turns files on disk into File nodes.

Other source plugins pull data from external APIs such as the
[Drupal](/plugins/gatsby-source-drupal/) and
[Hacker News](/plugins/gatsby-source-hacker-news/)

## Transformer plugins

Transformer plugins can also create nodes by transforming source nodes into new
types of nodes. It is very common when building Gatsby sites to install both
source plugin(s) and transformer plugins.

Nodes created by transformer plugins are set as "children" of their "parent"
nodes.

- The
  [Remark (Markdown library) transformer plugin](/plugins/gatsby-transformer-remark/)
  looks for new nodes that are created with a `mediaType` of `text/markdown` and
  then transforms these nodes into `MarkdownRemark` nodes with an `html` field.
- The [YAML transformer plugin](/plugins/gatsby-transformer-yaml/) looks for
  new nodes with a media type of `text/yaml` (e.g. a `.yaml` file) and creates
  new YAML child node(s) by parsing the YAML source into JavaScript objects.

## GraphQL

Gatsby automatically infers the structure of your site's nodes and creates a
GraphQL schema which you can then query from your site's components.

## Node Creation

To learn more about how nodes are created and linked together, check out the [Node Creation](/docs/node-creation/) documentation in the "Behind the Scenes" section.
