---
title: New Schema Customization API - Available in Gatsby 2.2.0
date: 2019-03-18
author: Mikhail Novikov
tags:
  - schema
  - graphql
---

Two weeks ago, we announced our plans for a [new schema customization API](/blog/2019-03-04-new-schema-customization/). Today we are making this set of new APIs and enhancements available to all in `gatsby`@`2.2.0`.

First, install the latest and greatest version of `gatsby`, like so:

```shell
npm install gatsby --save
```

Next, continue reading below to see if any of the great, new features we've enabled scratch a particular itch. We feel very confident you're going to love these new features 💜

# Recap of schema customization

Before this change, the Gatsby GraphQL schema was generated automatically from the data that the user added to Gatsby. While very convenient and easy to start, changes to the data could cause changes to the schema, which could cause breakage in unrelated locations. Those bugs were confusing and hard to debug. To alleviate this problem, we've added a schema customization API that lets you customize, fix, and enhance types in your Gatsby GraphQL schema.

There are two new APIs, `createTypes` and `createResolvers`.

## `createTypes`

`createTypes` can be used to define, fix, or extend a Node's GraphQL type representation. Think of it like an escape hatch to politely inform Gatsby of your data's shape and give the automatically inferred shape super powers.

```js:title=gatsby-node.js
exports.sourceNodes = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type AuthorJson implements Node {
      name: String
      birthday: Date
    }
  `
  createTypes(typeDefs)
}
```

After adding this to your gatsby-node, `AuthorJson` type will always have the fields name and birthday, regardless of the automatically inferred data shape. The rest of the fields will still be inferred normally, allowing you to still enjoy the benefits of Gatsby schema inference.

## `createResolvers`

`createResolvers` allows doing additional customization after all schema processing has been finished. Thus it can be used to add fields to any types, including root types like `Query` and types from third party schemas.

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

## The Type Builder API

While `createTypes` accepts `graphql-js` types along with the [Schema Definition Language (SDL)](https://www.prisma.io/blog/graphql-sdl-schema-definition-language-6755bcb9ce51) string, we've also added an option to use `graphql-js` types so that user could create types with resolvers. However, `graphql-js` is pretty verbose and it's hard to refer to types that don't yet exist or don't exist in a current scope. Therefore, we decided to add another programmatic API, that combines brevity of SDL with flexibility of `graphql-js`.

We can this API _Type Builder API_. It is available in the `schema` field of the arguments object passed to [Gatsby Node APIs](/docs/node-apis/).

```js:title=gatsby-node.js
exports.sourceNodes = ({ actions, schema }) => {
  const { createTypes } = actions
  createTypes([
    schema.buildObjectType({
      name: `CommentJson`,
      fields: {
        text: `String!`,
        blog: {
          type: `BlogJson`,
          resolve(parent, args, context) {
            return context.nodeModel.getNodeById({
              id: parent.author,
              type: `BlogJson`,
            })
          },
        },
        author: {
          type: `AuthorJson`,
          resolve(parent, args, context) {
            return context.nodeModel.getNodeById({
              id: parent.author,
              type: `AuthorJson`,
            })
          },
        },
      },
      interfaces: [`Node`],
    }),
  ])
}
```

# Potential for Breaking Changes

We have tried to avoid any breaking changes in this refactor of the underlying GraphQL layer, testing it in notable Gatsby sites and ensuring all tests were passing. However, there are areas where we needed to introduce more stable naming, and in these instances it _could_ be possible that a breaking change was introduced if you were using this undocumented API.

Specifically, before this refactor Gatsby type names weren't stable. They could have names like `frontmatter_2` because of some quirks in our schema generation. Now the types names are **stable** and **defined**. For a `Node`, it's always Pascal Camel Cased name of the `Node` type (for example, `AllMarkdownRemark`). For an inline object, it's the name of the node plus the name of the field, again Pascal Camel Cased. So `frontmatter_2` would be available as `MarkdownRemarkFrontmatter` now. If you've had fragments referring to some types by their old names, you may need to change it to new names, e.g.:

```diff
- fragment someFragment on frontmatter_2 {
+ fragment someFragment on MarkdownRemarkFrontmatter {
  title
}
```

Another change relates to inference. Before ordering of the Nodes in your data source could affect which type Gatsby inferred. Now, we always consider all possible types, thus you might experience type conflicts for conflicting data sources. It can be solved by either fixing the data or defining a type using new schema customization APIs that we've exposed.

# Wrap-up

As next steps, we will work on adding more convenient tooling to "freeze" your schema type definitions, so that you can quickly start using this feature. We will also be working on improving API docs for this.

We strongly believe that these new APIs are the foundation of an evolutionary leap of the Gatsby GraphQL API. These changes make the GraphQL API more stable, more robust, and more easily customizable. They will enable further customization and use cases, like [theming][/blog/2018-11-11-introducing-gatsby-themes/] and more still that we haven't even envisioned yet. We truly can't wait to see the great things you build and how you use these new APIs and improvements powered by Gatsby and its improved GraphQL layer.

## Additional Resources

- [Meta issue](https://github.com/gatsbyjs/gatsby/issues/12272) for bug reports
- [API docs for createTypes](/docs/actions/#createTypes)
- [API docs for createResolvers](/docs/node-apis/#createResolvers)
- [API docs for node model](/docs/node-model)
- [Using type definitions example](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-type-definitions)
