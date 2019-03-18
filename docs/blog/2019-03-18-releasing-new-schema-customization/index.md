---
title: Gatsby 2.2.0 Released - new schema customization API
date: 2019-03-18
author: Mikhail Novikov
tags: ["schema", "graphql"]
---

Two weeks ago, we talked about [new schema customization API](../2019-03-04-new-schema-customization). Today we are releasing it as a part of our 2.2.0 release.

# Recap of schema customization

Before this change, Gatsby GraphQL schema was generated from the data that user has fed to Gatsby. While very convenient and easy to start, changes to the data could cause changes to the schema, which could cause breakage in unrelated locations. Those bugs were confusing and hard to debug. To alleviate this problem, we've added a schema customization API, that lets you customize and fix types in your Gatsby GraphQL schema.

There are two new APIs, `createTypes` and `createResolvers`. `createTypes` can be used to define or fix your Node types GraphQL representation.

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

After adding this to your gatsby-node, `AuthorJson` type will always have fields name and birthday, regardless of the data shape in it's source. The rest of the fields will still be inferred normally, allowing you to still enjoy the benefits of Gatsby schema inference.

`createResolvers` allows doing additional customization after all schema processing has been finished. Thus it can be used to add fields to any types, including root types like `Query` and types from 3rd party schemas.

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

# Type builder API

While `createTypes` accepts `graphql-js` types along with SDL string. We've added option to use `graphql-js` types so that user could create types with resolvers. However, `graphql-js` is pretty verbose and it's hard to refer to types that don't yet exist or don't exist in a current scope. Therefore, we decided to add another programmatic API, that combines brevity of SDL with flexibility of `graphql-js`.

We can this API _Type Builder API_. One can access it under `schema` field of the arguments object passed to Gatbsy Node APIs.

```js
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

# Possible breaking changes

We have tried to avoid any breaking changes in this big refactoring and we replicated even the weird quirks of the previous system to make sure it stays compatible. However, there was some undefined behaviour that is now defined and it could cause breakage if you relied on that behaviour.

Previously, Gatsby type names weren't stable. They could have names like `frontmatter_2`, because of the quirk of our double schema generetion. Now the types names are stable and defined. For Nodes, it's always pascal camel cased name of the Node type. For inline object, it's name of the node plus the name of the field, again Pascal Camel Cased. So `frontmatter_2` would be called `MarkdownRemarkFrontmatter` now. If you've had fragments referring to some types by their old names, you would have to change it to new names.

Another change relates to inference. Before, ordering of the Nodes in your data source could affect which type Gatsby inferred. Now, we always consider all possible types, thus you might experience type conflicts for conflicting data sources. It can be solved by either fixing the data or defining a type using new schema customization API.

# Conclusion and further work

As next steps, we will work on adding more convenient tooling to "freeze" your schema type defininions, so that you could quickly start using this feature. We will also be working on improving API docs for this. Here are some useful links:

- [Meta issue](https://github.com/gatsbyjs/gatsby/issues/12272) for bug reports
- [API docs for createTypes](/docs/actions/#createTypes)
- [API docs for createResolvers](/docs/node-apis/#createResolvers)
- [API docs for node model](/docs/node-model)
- [Using type definitions example](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-type-definitions)
