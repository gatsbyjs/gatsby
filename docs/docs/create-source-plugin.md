---
title: "Create a source plugin"
---

There are two types of plugins that work within Gatsby's data system, "source"
and "transformer" plugins.

* **Source** plugins "source" data from remote or local locations into what
  Gatsby calls [nodes](/docs/node-interface/).
* **Transformer** plugins "transform" data provided by source plugins into new
  nodes and/or node fields.

For example:

The [`gatsby-source-filesystem`](/packages/gatsby-source-filesystem/) plugin
"sources" data about files from the file system. It creates nodes with a type
`File`, each File node corresponding to a file on the filesystem. On each node
are fields like the `absolutePath`, `extension`, `modifiedTime`, etc.

And importantly, each node created by the filesystem source plugin includes the
raw content of the file and its _media type_.

[A **media type**](https://en.wikipedia.org/wiki/Media_type) (also **MIME type**
and **content type**) are an official way to identify the format of
files/content that is transmitted on the internet e.g. over HTTP or through
email. You're probably familiar with many media types such as
`application/javascript`, `application/pdf`, `audio/mpeg`, `text/html`,
`text/plain`, `image/jpeg`, etc.

Each source plugin is responsible for setting the media type for the nodes they
create. This way, source and transformer plugins can work together easily.

This is not a required field but it's the way for source plugins to indicate to
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

This loose coupling between data source and transformer plugins allow Gatsby
site builders to quickly assemble complex data transformation pipelines with
little work on their (and your (the source plugin author)) part.

What does the code look like?

A source plugin is a normal NPM package. It has a package.json with optional
dependencies as well as a `gatsby-node.js` where you implement Gatsby's Node.js
APIs. Gatsby supports node versions back to Node 4 and as it's common to want to
use more modern node.js and JavaScript syntax, many plugins write code in a
`src` directory and compile the code. All plugins maintained in the Gatsby repo
follow this pattern.

Your `gatsby-node.js` should look something like:

```javascript
exports.sourceNodes = async ({ boundActionCreators }) => {
  const { createNode } = boundActionCreators;
  // Create nodes here, generally by downloading data
  // from a remote API.
  const data = await fetch(REMOTE_API);

  // Process data into nodes.
  data.forEach(datum => createNode(processDatum(datum)));

  // We're done, return.
  return;
};
```

Peruse the [`sourceNodes`](/docs/node-apis/#sourceNodes) and
[`createNode`](/docs/bound-action-creators/#createNode) docs for detailed
documentation on implementing those APIs.

But at a high-level, these are the jobs of a source plugin:

* Ensure local data is synced with its source and 100% accurate. If your source
  allows you to add an `updatedSince` query (or something similar) you can store
  the last time you fetched data using
  [`setPluginStatus`](/docs/bound-action-creators/#setPluginStatus).
* Create nodes with accurate media types, human meaningful types, and accurate
  contentDigests.
* "Link" nodes types you create as appropriate (see
  [_Node Link_](/docs/api-specification/) in the API specification concepts
  section.
* Return either a promise or use the callback (3rd parameter) to report back to
  Gatsby when you're done sourcing nodes. Otherwise either Gatsby will continue
  on before you're done sourcing or hang while waiting for you to indicate
  you're finished.

[`gatsby-node-helpers`](https://github.com/angeloashmore/gatsby-node-helpers),
a community-made NPM package, can help when writing source plugins. This
package provides a set of helper functions to generate Node objects with the
required fields. This includes automatically generating fields like node IDs
and the `contentDigest` MD5 hash, keeping your code focused on data gathering,
not boilerplate.
