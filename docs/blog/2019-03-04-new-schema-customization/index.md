---
title: New schema customization API in Gatsby
date: 2019-03-04
author: Mikhail Novikov
tags: ["graphql", "releases"]
---

Today we are releasing a preview of a new core Gatsby API - Schema Customization. It gives Gatsby users much better control over the inferred schema, solving many common issues that people have had with their data sources. In addition to adding the new API, we rewrote big chunks of schema generation code from scratch. This gives us a great long-term foundation that will let us make Gatsby GraphQL better in the future.

I would like to thank our community member [Stefan Probst](https://github.com/stefanprobst), who not only did lots of initial groundwork on the refactoring, but also helped immensely with the follow-up work there. We are really happy to have such a great community and super grateful to Stefan for all his hard work. I'd also like to thank [Pavel Chertorogov](https://github.com/nodkz/), the author of the [graphql-compose](https://graphql-compose.github.io/) library that we used, who's been super responsive to our bug reports and feature requests.

As it's a huge feature and big parts of the code are affected, we are releasing it as an alpha preview. You can try it by adding `gatsby@schema-customization` as a dependency for your Gatsby site.

```shell
npm install gatsby@schema-customization
```

We would really appreciate your help in surfacing any bugs in this code, so we encourage you to try it and report any issues that you encounter in [this pinned issue](https://github.com/gatsbyjs/gatsby/issues/12272). If you want to contribute to fixing some of those bugs, open PRs against [this branch](https://github.com/gatsbyjs/gatsby/pull/11480).

## Why was it needed?

The motivation to do this change is a two-fold one. Before this feature, Gatsby automatically generated a GraphQL schema for your site based on the data available from your source plugins. While this schema inference is great for getting started it has also been the cause of many problems.

Automatically generating schemas mean that changing your data can result in a changed schema. An updated schema may no longer work with the queries you've written, resulting in errors and confusion. Making schema generation smarter is just pouring more oil on an already burning fire. The core issue is not the inference, but lack of control. Therefore we wanted to give people control over the schema.

On the other hand, we wanted to reevaluate our approach to schemas in general. In the "wild", GraphQL is used very differently than in Gatsby. Schemas aren't as commonly generated from the data sources and often schemas are the source of truth. We want to experiment with enabling people to use that approach with Gatsby too. By allowing people to define types and resolvers, we open new opportunities in that direction. We want to see how the community reacts to these changes and if that will evolve into new approaches to defining schemas in Gatsby.

## New API

There are two main additions to the API:

1. A `createTypes` action that allows one to add, extend or fix the types by passing their type definition using [Graphql SDL](https://graphql.org/learn/schema/).
2. A `createResolvers` [Gatsby Node API](/docs/node-apis/) that can add or override resolvers on any types and fields in the schema. It can also add new fields with such resolvers.

Why the two APIs? `createTypes` primary purpose is to _fix_ the definition for an automatically generated Node type. Often one is totally happy with the default resolvers that Gatsby provides and the only issue is that inference can change based on data changes.

On the other hand, `createResolvers` is to add _extra functionality_ to types. `createResolvers` also allows adding new _root fields_ to Query type.

### `createTypes`

Let's consider an example with `gatsby-source-filesystem`, where we are loading data from an `authors.json` file. It has the following contents:

```json:title=authors.json
[
  {
    "name": "Mikhail Novikov",
    "birthday": "1987-09-25"
  }
]
```

This would be inferred in Gatsby as a Node type with a Date type for birthday.

```graphql
type AuthorsJson implements Node {
  # default gatsby node fields
  id: ID!
  parent: Node
  children: [Node!]!
  internal: `Internal`,
  # inferred fields
  name: String
  birthday: Date
}
```

However this can break if we accidentally add an invalid date as a birthday for a new node.

```json:title=authors.json
[
  {
    "name": "Mikhail Novikov",
    "birthday": "1987-09-25"
  },
  {
    "name": "Stefan Probst",
    "birthday": "Unknown"
  }
]
```

Now there is a type conflict between date and string and this will be inferred as string, possibly breaking our queries.

```graphql
type AuthorsJson implements Node {
  # default gatsby node fields
  id: ID!
  parent: Node
  children: [Node!]!
  internal: `Internal!`,
  # inferred fields
  name: String
  birthday: String
}
```

Luckily, now we can use the `createTypes` action to force birthday to be a Date.

```js
exports.sourceNodes = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    # One must say that the type is a Node
    type AuthorJson implements Node {
      # However Node fields are optional and you don't have to add them
      name: String
      birthday: Date
    }
  `
  createTypes(typeDefs)
}
```

Gatsby will now know that you want a Date and not override it with a string.

You can specify types for some or all of the fields that you have on the given node type. Gatsby will add missing fields. This behaviour can be controlled with `@infer` and `@dontInfer` directives.

```graphql
# For this type `name` won't be added
type AuthorJson implements Node @dontInfer {
  birthday: Date
}

# For this type `name` won't be added but `birthday` won't get a Gatsby resolver for date formatting
type AuthorJson implements Node @dontInfer(noDefaultResolvers: true) {
  birthday: Date
}

# For this type both `name` and `birthday` fields will be added. Current default behaviour, but allows one to be explicit about it.
type AuthorJson implements Node @infer {
  id: ID!
}

# `birthday` will be Date, but we won't add a Gatsby resolver for date formatting
type AuthorJson implements Node @infer(noDefaultResolvers: true) {
  id: ID!
}
```

### `createResolvers`

This is a similar API to `setFieldsOnGraphQLNodeType` in that it allows you to add new fields and resolvers to types. However, this one is run last, so you'd have the entire schema available to be augmented. It is also possible to extend the `Query` type to add custom root resolvers, which enables a powerful resolver-based approach to querying your data sources. `createResolvers` is called after third-party schemas are merged (e.g. ones added by `gatsby-source-graphql`), so you can extend those schemas too.

```js:title=gatsby-node.js
exports.createResolvers = ({ createResolvers, schema }) => {
  createResolvers({
    AuthorJson: {
      // Modify birthday resolver so that it uses 1970-01-01 as default date
      birthday: {
        resolve(source, args, context, info) {
          // original resolver available as "info.originalResolver"
          if (Number.isNaN(new Date(source["birthday"]))) {
            return info.originalResolver(
              {
                ...source,
                birthday: "1970-01-01",
              },
              args,
              context,
              info
            )
          } else {
            return info.originalResolver(source, args, context, info)
          }
        },
      },
    },
  })
}
```

It's also possible to create new root fields, for example one that will return all author names as strings.

```js:title=gatsby-node.js
createResolvers({
  Query: {
    allAuthorFullNames: {
      type: `[String!]!`,
      resolve(source, args, context, info) {
        const authors = context.nodeModel.getAllNodes({
          type: `AuthorJson`,
        })
        return authors.map(author => author.name)
      },
    },
  },
})
```

Notice the `context.nodeModel`. We expose our internal node storage to the resolvers, so that one can fetch data from there. In addition to lower level access functions (`getNodeById`, `getAllNodes`), full node querying is available in `runQuery`.

You can also see [using-type-definitions example](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-type-definitions) in the Gatsby repository.

## Other niceties

Refactoring the schema generation allowed us to fix some related long-standing bugs and issues.

### Type Names

Previously, type names were generated with names like `internal_2` or `SomeType_2`, which can be extremely confusing. We've normalized all the names, so that these additional suffixes are no longer necessary. If you have relied on generated names as above, this branch will break for you. However, we never considered these types to be part our public API, partially because of the above issue. By making this change we can now assert that the naming of the types should be stable.

### Connection `nodes` field

Querying connections is pretty verbose in Gatsby.

```graphql
{
  allMarkdownRemark {
    edges {
      node {
        id
      }
    }
  }
}
```

When you have many connections, this becomes pretty tedious, especially destructuring it all in JS. We've added a very common shortcut `nodes` that allows you to not write `{ edges { node }}`, but directly resolves an array of nodes instead.

```graphql
{
  allMarkdownRemark {
    nodes {
      id
    }
  }
}
```

### Inference quirks

We've had some quirks in inference that were dependant on ordering. We've made all inference deterministic.

1. Mix of date and non-date strings is always a string
2. Conflicting field names always prefer Node references first and then the canonical name of the field.

## How did we do it?

The biggest issue with building GraphQL schemas with `graphql-js` is that `graphql-js` expects all types to be final at the moment where either the schema is created or one inspects the fields of the type. This is solved in `graphql-js` by using _thunks_, non-argument functions that refer to types in some global context. With hand-written schemas usually there are type definitions in the same file as the newly defined type, but this isn't available in a generated schema situation.

```js
const Foo = graphql.GraphQLObjectType({
  name: "Foo",
  fields: () => ({
    id: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLID),
    },
    bar: {
      // Must be an actual reference to that type
      type: Bar,
    },
  }),
})
```

To solve these issues, a pattern called _Type Registry_ has been widely used. A type registry is an abstraction that holds types inside it and allows other types to retrieve them.

```js
// some global state type registry
const TypeRegistry = require("./typeRegistry")

const Foo = graphql.GraphQLObjectType({
  name: "Foo",
  fields: () => ({
    id: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLID),
    },
    bar: {
      // Allows referring to types by their string names
      type: TypeRegistry.getType("Bar"),
    },
  }),
})
```

After all types are collected into the type registry, the registry can be converted to a normal GraphQL schema. Other common features include being able to generate types like input objects and filter from the types held in the type registry.

We didn't want to implement a type registry and all the related parts ourselves. Thankfully, there is a library just for that - [graphql-compose](https://graphql-compose.github.io/). We opted to use it and it saved us lots of time. I really recommend this library to anyone, especially if you plan to generate types.

```js
// global schema composer
const { SchemaComposer } = require("graphql-compose")

const Foo = SchemaComposer.TypeComposer.create(({
  name: "Foo",
  fields: () => ({
    id: {
      // types can be strings
      type: 'ID!'
    },
    bar: {
      // Allows referring to types by their string names
      type: 'Bar'
    },
  }),
})
```

The final schema pipeline that we implemented works like this:

1. We collect all types that are created with `createTypes` and add them to the compose type registry (called _Schema Composer_)
2. We go through all the collected nodes and we infer types for them
3. We merge user defined types with inferred types and add them to the composer
4. We add default resolvers for type fields, such as for `File` and `Date` fields
5. `setFieldsOnNodeType` is called and those fields are added to the types
6. We create derived input objects, such as filter and sort and then create pagination types such as Connections
7. Root level resolvers are created for all node types
8. Third-party schemas are merged into the Gatsby schema
9. The `createResolvers` API is called and resulting resolvers are added to the schema
10. We generate the schema

You can see the `packages/gatsby/schema/` folder in the [schema refactoring PR](https://github.com/gatsbyjs/gatsby/pull/11480) to learn more about the code.

## Further work

These schema changes are a first step. In the future we want to add more control over the schema and more access to our internal APIs to our users. Our next step would be to add explicit types to the plugins that we maintain. We also want to let those plugins expose their internal APIs through the Model layer, like we did for our root Node API. This way one can reuse the functionality that is only available in plugins in their own resolvers.

We are super excited about those changes. As I mentioned, we really encourage you to try it by adding `gatsby@schema-customization` as a dependency to your Gatsby application. Send us feedback in [this issue](https://github.com/gatsbyjs/gatsby/issues/12272). We can't wait to hear your feedback on this new, core functionality and see all the great apps and functionality it allows you to build.
