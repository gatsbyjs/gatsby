---
title: Creating a Source Plugin
---

Source plugins are essentially out of the box integrations between Gatsby and various third-party systems.

These systems can be CMSs like Contentful or WordPress, other cloud services like Lever and Strava, or your local filesystem -- literally anything that has an API. Currently, Gatsby has [over 300 source plugins](/plugins/?=gatsby-source).

Once a source plugin brings data into Gatsby's system, it can be transformed further with **transformer plugins**.

## What do source plugins do?

At a high-level, a source plugin:

- Ensures local data is synced with its source and is 100% accurate.
- Creates nodes with accurate media types, human meaningful types, and accurate
  contentDigests.
- Links nodes & creates relationships between them.
- Lets Gatsby know when nodes are finished sourcing so it can move on to processing them.

## What does the code look like?

A source plugin is a normal NPM package. It has a package.json with optional
dependencies as well as a `gatsby-node.js` where you implement Gatsby's Node.js
APIs.

Gatsby's minimum supported Node.js version is Node 8 and as it's common to want to use more modern Node.js and JavaScript syntax, many plugins write code in a
source directory and compile the code. All plugins maintained in the Gatsby repo
follow this pattern.

Your `gatsby-node.js` should look something like:

```javascript:title=gatsby-node.js
exports.sourceNodes = async ({ actions }) => {
  const { createNode } = actions
  // Create nodes here, generally by downloading data
  // from a remote API.
  const data = await fetch(REMOTE_API)

  // Process data into nodes.
  data.forEach(datum => createNode(processDatum(datum)))

  // We're done, return.
  return
}
```

Peruse the [`sourceNodes`](/docs/node-apis/#sourceNodes) and
[`createNode`](/docs/actions/#createNode) docs for detailed
documentation on implementing those APIs.

### Transforming data received from remote sources

Each node created by the filesystem source plugin includes the
raw content of the file and its _media type_.

[A **media type**](https://en.wikipedia.org/wiki/Media_type) (also **MIME type**
and **content type**) are an official way to identify the format of
files/content that is transmitted on the internet e.g. over HTTP or through
email. You're probably familiar with many media types such as
`application/javascript`, `application/pdf`, `audio/mpeg`, `text/html`,
`text/plain`, `image/jpeg`, etc.

Each source plugin is responsible for setting the media type for the nodes they
create. This way, source and transformer plugins can work together easily.

This is not a required field -- if it's not provided, Gatsby will infer the type from data that is sent -- but it's the way for source plugins to indicate to
transformers that there is "raw" data that can still be further processed. It
allows plugins to remain small and focused. Source plugins don't have to have
opinions on how to transform their data. They can just set the `mediaType` and
push that responsibility to transformer plugins.

For example, it's quite common for services to allow you to add content as
markdown. If you pull that markdown into Gatsby and create a new node, what
then? How would a user of your source plugin convert that markdown into HTML
they can use in their site? Luckily you don't have to do anything. Just create a
node for the markdown content and set its mediaType as `text/markdown` and the
various Gatsby markdown transformer plugins will see your node and transform it
into HTML.

This loose coupling between the data source and the transformer plugins allow Gatsby site builders to quickly assemble complex data transformation pipelines with
little work on their (and your (the source plugin author)) part.

## Getting helper functions

[`gatsby-node-helpers`](https://github.com/angeloashmore/gatsby-node-helpers),
a community-made NPM package, can help when writing source plugins. This
package provides a set of helper functions to generate Node objects with the
required fields. This includes automatically generating fields like node IDs
and the `contentDigest` MD5 hash, keeping your code focused on data gathering,
not boilerplate.

## Gotcha: don't forget to return!

After your plugin is finished sourcing nodes, it should either return a promise or use the callback (3rd parameter) to report back to Gatsby when `sourceNodes` is fully executed. If a promise or callback isn't returned, Gatsby will continue on in the build process, before nodes are finished being created. Your nodes might not end up in the generated schema at compilation, or the process will hang while waiting for an indication that it's finished.

## Advanced

### Adding relationships between nodes

Gatsby source plugins not only create nodes, they also create relationships between nodes that are exposed to GraphQL queries.

There are two ways of adding node relationships in Gatsby: (1) transformations (parent-child) or (2) foreign-key based.

#### Option 1: transformation relationships

An example of a transformation relationship is the `gatsby-transformer-remark` plugin, which transforms a parent `File` node's markdown string into a `MarkdownRemark` node. The Remark transformer plugin adds its newly created child node as a child of the parent node using the action [`createParentChildLink`](/docs/actions/#createParentChildLink). Transformation relationships are used when a new node is _completely_ derived from a single parent node. E.g. the markdown node is derived from the parent `File` node and wouldn't ever exist if the parent `File` node hadn't been created.

Because all children nodes are derived from their parent, when a parent node is deleted or changed, Gatsby deletes all of the child nodes (and their child nodes, and so on) with the expectation that they'll be recreated again by transformer plugins. This is done to ensure there are no nodes left over that were derived from older versions of data but shouldn't exist any longer.

_Creating the transformation relationship_

In order to create a parent/child relationship, when calling `createNode` for the child node, the new node object that is passed in should have a `parent` key with the value set to the parent node's `id`. After this, call the `createParentChildLink` function exported inside `actions`.

_Examples_

[Here's the above example](https://github.com/gatsbyjs/gatsby/blob/72077527b4acd3f2109ed5a2fcb780cddefee35a/packages/gatsby-transformer-remark/src/on-node-create.js#L39-L67) from the `gatsby-transformer-remark` source plugin.

[Here's another example](https://github.com/gatsbyjs/gatsby/blob/1fb19f9ad16618acdac7eda33d295d8ceba7f393/packages/gatsby-transformer-sharp/src/on-node-create.js#L3-L25) from the `gatsby-transformer-sharp` source plugin.

#### Option 2: foreign-key relationships

An example of a foreign-key relationship would be a Post that has an Author.

In this relationship, each object is a distinct entity that exists whether or not the other does, with independent schemas, and field(s) on each entity that reference the other entity -- in this case the Post would have an Author, and the Author might have Posts. The API of a service that allows complex object modelling, for example a CMS, will often allow users to add relationships between entities and expose them through the API.

When an object node is deleted, Gatsby _does not_ delete any referenced entities. When using foreign-key references, it's a source plugin's responsibility to clean up any dangling entity references.

##### Creating the relationship

Suppose you want to create a relationship between Posts and Authors, and you want to call the field `author`.

Before you pass the Post object and Author object into `createNode` and create the respective nodes, you need to create a field called `author___NODE` on the Post object to hold the relationship to Authors. The value of this field should be the node ID of the Author.

##### Creating the reverse relationship

It's often convenient for querying to add to the schema backwards references. For example, you might want to query the Author of a Post but you might also want to query all the posts an author has written.

If you want to call this field on `Author` `posts`, you would create a field called `posts___NODE` to hold the relationship to Posts. The value of this field should be an array of Post IDs.

Here's an example from the [WordPress source plugin](https://github.com/gatsbyjs/gatsby/blob/1fb19f9ad16618acdac7eda33d295d8ceba7f393/packages/gatsby-source-wordpress/src/normalize.js#L178-L189).

#### Union types

When creating fields linking to an array of nodes, if the array of IDs are all of the same type, the relationship field that is created will be of this type. If the linked nodes are of different types; the field will turn into a union type of all types that are linked. See the [GraphQL documentation on how to query union types](https://graphql.org/learn/schema/#union-types).

#### Further specification

See
[_Node Link_](/docs/api-specification/) in the API specification concepts
section for more info.

### Improve plugin developer experience by enabling faster sync

One tip to improve the development experience of using a plugin is to reduce the time it takes to sync between Gatsby and the data source. There are two tips for doing this:

- **Add event-based sync**. Some data sources keep event logs and are able to return a list of objects modified since a given time. If you're building a source plugin, you can store
  the last time you fetched data using
  [`setPluginStatus`](/docs/actions/#setPluginStatus) and then only sync down nodes that have been modified since that time. [gatsby-source-contentful](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-contentful) is an example of a source plugin that does this.
- **Proactively fetch updates**. One challenge when developing locally is that a developer might make modifications in a remote data source, like a CMS, and then want to see how it looks in the local environment. Typically they will have to restart the `gatsby develop` server to see changes. This can be avoided if your source plugin knows to proactively fetch updates from the remote server. For example,`gatsby-source-sanity` ([source](https://github.com/sanity-io/gatsby-source-sanity)), listens to changes to Sanity content when `watchMode` is enabled and pulls them into the Gatsby develop server.
