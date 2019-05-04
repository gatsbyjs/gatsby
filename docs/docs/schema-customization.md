# Customizing the GraphQL Schema

One of Gatsby's main strengths is the ability to query data from a variety of
sources in a uniform way with GraphQL. For this to work, a GraphQL Schema must
be generated that defines the shape of the data.

Gatsby is able to automatically infer a GraphQL Schema from your data, and in
many cases this is really all you need. There are however situations when you
either want to explicitly define the data shape, or add custom functionality to
the query layer - this is what Gatsby's Schema Customization API provides.

The following guide walks through a basic example to showcase the API.

# Explicitly defining data types

Our example project is a blog that gets its data from local Markdown files which
provide the post contents, as well as author information in JSON format. We also
have occasional guest contributors whose info we keep in a separate JSON file.

```markdown:title=src/data/post1.md
---
title: Sample Post
publishedAt: 2019-04-01
author: jane@example.com
tags:
  - wow
---

# Heading

Text
```

```json:title=src/data/author.json
[
  {
    "name": "Doe",
    "firstName": "Jane",
    "email": "jane@example.com",
    "joinedAt": "2018-01-01"
  }
]
```

```json:title=src/data/contributor.json
[
  {
    "name": "Doe",
    "firstName": "Zoe",
    "email": "zoe@example.com",
    "receivedSwag": true
  }
]
```

To be able to query the contents of these files with GraphQL, we need to first
load them into Gatsby's internal data store. This is what source and transformer
plugin accomplish - in this case `gatsby-source-filesystem` and
`gatsby-transformer-remark` plus `gatsby-transformer-json`. Every markdown post
file is hereby transformed into a "node" object in the internal data store with
a unique `id` and a type `MarkdownRemark`. Similarly, an author will be
represented by a node object of type `AuthorJson`, and contributor info will be
transformed into node objects of type `ContributorJson`.

## The Node interface

This data structure is represented in Gatsby's GraphQL schema with the `Node`
interface, which describes the set of fields common to node objects created by
source and transformer plugins (`id`, `parent`, `children`, as well as a couple
of `internal` fields like `type`). In GraphQL Schema Definition Language (SDL),
it looks like this:

```graphql
interface Node {
  id: ID!
  parent: Node!
  children: [Node!]!
  internal: Internal!
}

type Internal {
  type: String!
}
```

Types created by source and transformer plugins implement this interface. For
example, the node type created by `gatsby-transformer-json` for `authors.json`
will be represented in the GraphQL schema as:

```graphql
type AuthorJson implements Node {
  id: ID!
  parent: Node!
  children: [Node!]!
  internal: Internal!
  name: String
  firstName: String
  email: String
  joinedAt: Date
}
```

## Automatic type inference

It's important to note that the data in
`author.json` does not provide type information of the Author fields by itself.
In order to translate the data shape into GraphQL type definitions, Gatsby has
to inspect the contents of every field and check its type. In many cases this
works very well and it is still the default mechanism for creating a GraphQL
schema.

There are however two problems with this approach: (1) it is quite
time-consuming and therefore does not scale very well and (2) if the values on a
field are of different types Gatsby cannot decide which one is the correct one.
A consequence of this is that if your data sources change, type inference could
suddenly fail.

Both problems can be solved by providing explicit type definitions for Gatsby's
GraphQL schema.

## Creating type definitions

Let's take the latter case first. Assume a new author joins the team, but in the
new author entry there is a typo on the `joinedAt` field: "201-04-02" which is
not a valid Date.

```diff:title=src/data/author.json
+  {
+    "name": "Doe",
+    "firstName": "John",
+    "email": "john@example.com",
+    "joinedAt": "201-04-02"
+  }
]
```

This will confuse Gatsby's type inference since the `joinedAt`
field will now have both Date and String values.

### Fixing field types

To ensure that the field will always be of Date type, you can provide explicit
type definitions to Gatsby with the `createTypes` action. It accepts type
definitions in GraphQL Schema Definition Language:

```js:title=gatsby-node.js
exports.sourceNodes = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type AuthorJson implements Node {
      joinedAt: Date
    }
  `
  createTypes(typeDefs)
}
```

Note that the rest of the fields (`name`, `firstName` etc.) don't have to be
provided, they will still be handled by Gatsby's type inference.

> Although the `createTypes` action is passed to all `gatsby-node` APIs,
> it has to be called before schema generation. We recommend to use the
> [`sourceNodes` API](https://gatsby.dev/api/#sourceNodes).

### Opting out of type inference

There are however advantages to providing full definitions for a node type, and
bypassing the type inference mechanism altogether. With smaller scale projects
inference is usually not a performance problem, but as projects grow the
performance penalty of having to check each field type will become noticable.

Gatsby allows to opt out of inference with the `@dontInfer` directive

- which in turn requires that you explicitly provide type definitions
  for all fields that should be available for querying:

```js:title=gatsby-node.js
exports.sourceNodes = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type AuthorJson implements Node @dontInfer {
      name: String!
      firstName: String!
      email: String!
      joinedAt: Date
    }
  `
  createTypes(typeDefs)
}
```

Note that you don't need to explicitly provide the Node interface fields (`id`,
`parent`, etc.), Gatsby will automatically add them for you.

> If you wonder about the exclamation marks - those allow specifying nullability
> in GraphQL, i.e. if a field value is allowed to be `null` or not.

### Nested types

So far we have only been dealing with scalar values (`String` and `Date`;
GraphQL also knows `ID`, `Int`, `Float`, `Boolean` and `JSON`). Fields can
however also contain complex object values. To target those fields in GraphQL SDL, you
can provide a full type definition for the nested type, which can be arbitrarily
named (as long as the name is unique in the schema). In our example project, the
`frontmatter` field on the `MarkdownRemark` node type is a good example. Say we
want to ensure that `frontmatter.tags` will always be an array of strings.

```js:title=gatsby-node.js
exports.sourceNodes = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
    }
    type Frontmatter {
      tags: [String!]!
    }
  `
  createTypes(typeDefs)
}
```

Note that with `createTypes` we cannot directly target a `Frontmatter` type
without also specifying that this is the type of the `frontmatter` field on the
`MarkdownRemark` type, The following would fail because Gatsby would have no way
of knowing which field the `Frontmatter` type should be applied to:

```js:title=gatsby-node.js
exports.sourceNodes = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    # This will fail!!!
    type Frontmatter {
      tags: [String]!
    }
  `
  createTypes(typeDefs)
}
```

It is useful to think about your data, and the corresponding GraphQL schema, by
always starting from the Node types created by source and transformer plugins.

> Note that the `Frontmatter` type must not implement the Node interface since
> it is not a top-level type created by source or transformer plugins: it has no
> `id` field, and is just there to describe the data shape on a nested field.

### Gatsby Type Builders

In many cases, GraphQL SDL provides a succinct way to provide type definitions
for your schema. If however you need more flexibility, `createTypes` also
accepts `graphql-js` types, as well as definitions provided with the help of
Gatsby Type Builders, which are more flexible than SDL syntax but less verbose
than `graphql-js`. They are accessible on the `schema` argument passed to Node
APIs.

```js
exports.sourceNodes = ({ actions, schema }) => {
  const { createTypes } = actions
  const typeDefs = [
    schema.buildObjectType({
      name: "ContributorJson",
      fields: {
        name: "String!",
        firstName: "String!",
        email: "String!",
        receivedSwag: {
          type: "Boolean",
          resolve: source => source.receivedSwag || false,
        },
      },
      interfaces: ["Node"],
    }),
  ]
  createTypes(typeDefs)
}
```

Gatsby Type Builders allow referencing types as simple strings, and accept full
field configs ('type', 'args', 'resolve').

> Type Builders also exist for Input, Interface and Union types:
> `buildInputType`, `buildInterfaceType`, and `buildUnionType`.

### Foreign-key fields

Gatsby's automatic type inference has one trick up its sleeve: for every field
that ends in `___NODE` it will interpret the field value as an `id` and create a
foreign-key relation.

Unfortunately, creating foreign-key relations with the `createTypes` action,
i.e. without relying on type inference and the `___NODE` field naming
convention, currently still requires a bit of manual setup.

In our example project, we want the `frontmatter.author` field on
`MarkdownRemark` nodes to expand a provided `id` to a full `AuthorJson` node.
For this to work, we have to provide a custom field resolver. (see below for
more info on `context.nodeModel`)

```js
exports.sourceNodes = ({ action, schema }) => {
  const { createTypes } = actions
  const typeDefs = [
    "type MarkdownRemark implements Node { frontmatter: Frontmatter }",
    schema.buildObjectType({
      name: "Frontmatter",
      fields: {
        author: {
          type: "AuthorJson",
          resolve: (source, args, context, info) => {
            // If we were linking by ID, we could use `getNodeById` to
            // find the correct author:
            // return context.nodeModel.getNodeById({
            //   id: source.author,
            //   type: "AuthorJson",
            // })
            // But since we are using the author email as foreign key,
            // we can use `runQuery`, or simply get all author nodes
            // with `getAllNodes` and manually find the linked author
            // node:
            return context.nodeModel
              .getAllNodes({ type: "AuthorJson" })
              .find(author => author.email === source.author)
          },
        },
      },
    }),
  ]
  createTypes(typeDefs)
}
```

What is happening here is that we provide a custom field resolver that asks
Gatsby's internal data store for the the full node object with the specified
`id` and `type`.

> Message from the Future: Gatsby will soon(TM) expose some of its internal
> helpers to make these things a lot easier. It might look something
> like this:

```graphql
type MarkdownRemark implements Node {
  frontmatter: Frontmatter
}
type Frontmatter {
  author: AuthorJson @link # default foreign-key relation by `id`
  reviewers: [AuthorJson] @link(by: "email") # foreign-key relation by custom field
}
type AuthorJson implements Node {
  posts: [MarkdownRemark] @link(by: "frontmatter.author", from: "email") # easy back-ref
}
```

# createResolvers API

While it is possible to directly pass `args` and `resolvers` along the type
definitions using Gatsby Type Builders, an alternative approach specifically
tailored towards adding custom resolvers to fields is the `createResolvers` Node
API.

```js
exports.createResolvers = ({ createResolvers }) => {
  const resolvers = {
    Frontmatter: {
      author: {
        resolve(source, args, context, info) {
          return context.nodeModel.getNodeById({
            id: source.author,
            type: "AuthorJson",
          })
        },
      },
    },
  }
  createResolvers(resolvers)
}
```

Note that `createResolvers` allows adding new fields to types, modifying `args`
and `resolver` -- but not overriding the field type. This is because
`createResolvers` is run last in schema generation, and modifying a field type
would mean having to regenerate corresponding input types (`filter`, `sort`),
which we want to avoid. If possible, specifying field types should be done with
the `createTypes` action.

## Accessing Gatsby's data store from field resolvers

As mentioned above, Gatsby's internal data store and query capabilities are
available to custom field resolvers on the `context.nodeModel` argument passed
to every resolver. Accessing node(s) by `id` (and optional type) is possible
with `getNodeById` and `getNodesByIds`. To get all nodes, or all nodes of a
certain type, use `getAllNodes`. And running a query from inside your resolver
functions can be accomplished with `runQuery`, which accepts `filter`, `sort`,
`limit` and `skip` query arguments.

We could for example add a field to the `AuthorJson` type that lists all recent
posts by an author:

```js
exports.createResolvers = ({ createResolvers }) => {
  const resolvers = {
    AuthorJson: {
      recentPosts: {
        type: ["MarkdownRemark"],
        resolve(source, args, context, info) {
          return context.nodeModel.runQuery({
            query: {
              filter: {
                frontmatter: {
                  author: { eq: source.email },
                  date: { gt: "2019-01-01" },
                },
              },
            },
            type: "MarkdownRemark",
            firstOnly: false,
          })
        },
      },
    },
  }
  createResolvers(resolvers)
}
```

## Custom query fields

One powerful approach enabled by `createResolvers` is adding custom root query
fields. While the default root query fields added by Gatsby (e.g.
`markdownRemark` and `allMarkdownRemark`) provide the whole range of query
options, query fields designed specifically for your project can be useful. For
example, we can add a query field for all external contributors to our example blog
who have received their swag:

```js
exports.createResolvers = ({ createResolvers }) => {
  const resolvers = {
    Query: {
      contributorsWithSwag: {
        type: ["ContributorJson"],
        resolve(source, args, context, info) {
          return context.nodeModel.runQuery({
            query: {
              filter: {
                receivedSwag: { eq: true },
              },
            },
            type: "ContributorJson",
            firstOnly: false,
          })
        },
      },
    },
  }
  createResolvers(resolvers)
}
```

Because we might also be interested in the reverse - which contributors haven't
received their swag yet - why not add a (required) custom query arg?

```js
exports.createResolvers = ({ createResolvers }) => {
  const resolvers = {
    Query: {
      contributors: {
        type: ["ContributorJson"],
        args: {
          receivedSwag: "Boolean!",
        },
        resolve(source, args, context, info) {
          return context.nodeModel.runQuery({
            query: {
              filter: {
                receivedSwag: { eq: args.receivedSwag },
              },
            },
            type: "ContributorJson",
            firstOnly: false,
          })
        },
      },
    },
  }
  createResolvers(resolvers)
}
```

## Taking care of Hot reloading

When creating custom field resolvers, it is important to ensure that Gatsby
knows about the data a page depends on for hot reloading to work properly. When
you retrieve nodes from the store with `context.nodeModel` methods, it is
usually not necessary to do anything manually, because Gatsby will register
dependencies for the query results automatically. The exception is `getAllNodes`
which will _not_ register data dependencies by default. This is because
requesting re-running of queries when any node of a certain type changes is
potentially a very expensive operation. If you are sure you really need this,
you can add a page data dependency either programmatically with
`context.nodeModel.trackPageDependencies`, or with:

```js
context.nodeModel.getAllNodes(
  { type: "MarkdownRemark" },
  { connectionType: "MarkdownRemark" }
)
```

# Custom Interfaces and Unions

Finally, let's say we want to have a page on our example blog that lists all
team members (authors and contributors). What we could do is have two queries,
one for `allAuthorJson` and one for `allContributorJson` and manually merge
those. GraphQL however provides a more elegant solution to these kinds of
problems with "abstract types" (Interfaces amd Unions). Since authors and
contributors actually share most of the fields, we can abstract those up into
a `TeamMember` interface and add a custom query field for all team members
(as well as a custom resolver for full names):

```js
exports.sourceNodes = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    interface TeamMember {
      name: String!
      firstName: String!
      email: String!
    }

    type AuthorJson implements Node & TeamMember {
      name: String!
      firstName: String!
      email: String!
      joinedAt: Date
    }

    type ContributorJson implements Node & TeamMember {
      name: String!
      firstName: String!
      email: String!
      receivedSwag: Boolean
    }
  `
}

exports.createResolvers = ({ createResolvers }) => {
  const fullName = {
    type: "String",
    resolve(source, args, context, info) {
      return source.firstName + " " + source.name
    },
  }
  const resolvers = {
    Query: {
      allTeamMembers: {
        type: ["TeamMember"],
        resolve(source, args, context, info) {
          return context.nodeModel.getAllNodes({ type: "TeamMember" })
        },
      },
    },
    AuthorJson: {
      fullName,
    },
    ContributorJson: {
      fullName,
    },
  }
  createResolvers(resolvers)
}
```

To use the newly added root query field in a page query to get the full names of
all team members, we can write:

```js
export const query = graphql`
  {
    allTeamMembers {
      ... on Author {
        fullName
      }
      ... on Contributor {
        fullName
      }
    }
  }
`
```

# Extending third-party types
