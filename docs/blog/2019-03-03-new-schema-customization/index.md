---
title: New schema customization API in Gatsby
date: 2019-03-03
author: Mikhail Novikov
tags: ["schema", "graphql"]
---

Today we are releasing a preview of a new core Gatsby API - Schema Customization. It gives Gatsby user a much better control over the inferred schema, solving many common issues that people have with their data sources. In addition to adding the new API, we rewrote big chunks of schema generation code from scratch. This gives us a great long-term foundation that will let us make Gatsby GraphQL better in the future.

I would like to thank our community member [Stefan Probst](https://github.com/stefanprobst), who not only did lots of initial groundwork on the refactoring, but also helped immensely with the follow-up work there. We are really happy to have such a great community and super grateful to Stefan for all his hard work. I'd also like to thank [Pavev Chertogov](https://github.com/nodkz/), the author of the [graphql-compose](https://graphql-compose.github.io/) library that we used, who's been super responsive to our bug reports and feature requests.

As it's a huge feature and big parts of the code are affected, we are releasing it as an alpha preview. You can install it through TODO INSTRUCTIONS. We would really like your help in finding out potential bugs in this code, so we encourage you to try it and report any issues that you encounter in this TODO PINNED THREAD.

# New API

There are two main additions to the API:

1. `createTypes` action, which allows one to add, extend or fix the types by passing their type definition using TODO LINK graphql SDL.
2. `createResolvers` Gatsby Node API, that can add or override resolvers on any types and fields in the schema. It can also add new fields with such resolvers.

Why the two APIs? `createTypes` primary purpose is to _fix_ the definition for some of the Node type. Often one is totally happy with default resolvers that Gatsby provides and the only issue is that inference can change based on the data changes.

On the other hand, `createResolvers` is to add _additional functionality_ to types. `createResolvers` also allows adding new _root fields_ to Query type.

## `createTypes`

Let's consider an example with `gatsby-source-filesystem`, where we are loading data from `authors.json` file. It has the following contents:

```json
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

However this can break if we accidentally add invalid date as a birthday for a new node.

```json
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

````graphql
```graphql
type AuthorsJson implements Node {
  # default gatsby node fields
  id: ID!
  parent: Node
  children: [Node!]!
  internal: `Internal`,
  # inferred fields
  name: String
  birthday: String
}
````

Luckily, now we can use `createTypes` action to force birthday to be a Date.

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
@dontInfer()
type AuthorJson implements Node {
  birthday: Date
}

# For this type `name` won't be added but birtday won't get a Gatsby resolver for date formatting
@dontInfer(noDefaultResolvers: true)
type AuthorJson implements Node {
  birthday: Date
}


# For this type all fields `name`. Current default behaviour, but allows one to be explicit about it.
@infer()
type AuthorJson implements Node {
  id: ID!
}

# Birthday will be Date, but we won't add a Gatsby resolver for date formatting
@infer(noDefaultResolvers: true)
type AuthorJson implements Node {
  id: ID!
}
```

## `createResolvers`

This is a similar API to `setFieldsOnNodeType` in that it allows to add new fields and resolvers for them. However, this one is ran last, so you'd have all the schema available to you in it. Also it's possible to extend types like `Query` to add more root resolvers.

```js
exports.createResolvers = ({ createResolvers, schema }) => {
  createResolvers({
    AuthorJson: {
      // Modify birthday resolver so that it uses 1970-01-01 as default date
      birthday: {
        resolve(source, args, context, info) {
          // original resolver available as "info.originalResolver"
          if (Number.isNaN(new Date(source['birthday'])) {
            return info.originalResolver({
              ...source,
              birthday: '1970-01-01',
            }, args, context, info)
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

```js
createResolvers({
  Query: {
    allAuthorFullNames: {
      type: `[String!]!`,
      resolve(source, args, context, info) {
        const authors = context.nodeModel.getAllNodes(
          {
            type: `AuthorJson`,
          },
          { path: context.path }
        )
        return authors.map(author => author.name)
      },
    },
  },
})
```

Notice the `context.nodeModel`. We expose our internal node storage to the resolvers, so that one can fetch data from there. Full documentation of nodeModel is available at TODO.

You can also see TODO ADD using resolvers example.

# Why was it needed?

The motivation to do this change is a two-fold one. We've seen many issues with automatically generated schemas. They can change from a minor data source modification, like changing one fields. The resulting schema will break queries on the pages and will leave users confused. Making inference smarter is just pouring more oil on already burning fire, because the core issue is not the inferrence, but lack of control. Therefore we wanted to give people control over the schema.

On the other hand, we wanted to reevaluate our approach to schema in general. In the "wild", GraphQL is used very differently than in Gatsby. Schemas aren't as commonly generated from the data sources and often schemas are the source of truth. We want to experiment with enabling people to use that approach with Gatsby too. By allowing people to define types and resolvers, we open new opportunities in that direction. We want to see how the community reacts to that and if that will evolve in some new approaches to defining schemas in Gatsby.

# How did we do it?

The biggest issue with building GraphQL schemas with `graphql-js` is that `graphql-js` expects all types to be final at the moment where either schema is created or one inspects the fields of the type. This is solved in graphql-js by using _thunks_, a non-argument functions that refer to types in some global context. With hand-written schemas it's usually type definitions in the same file as the newly defined type, but this isn't available in generated schema situation.

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

To solve this issues, a pattern called _Type Registry_ has been widely used. Type registry is some kind of abstraction that holds types inside it and allows other types to retrieve them.

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

After all types are collected into type registry, it can be converted to a normal GraphQL schema. Other common features include being able to generate types like input objects and filter from the types held in type registry.

We didn't want to implement type registry and all the related things ourselves. Thankfully, there is a library just for that - [graphql-compose](https://graphql-compose.github.io/). We opted to use it and it saved us lots of time. I really recommend this library to anyone, especially if you plan to generate the types.

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

1. We collect all types that are created with `createTypes` and add them to compose type registry (called _Schema Composer_).
2. We go through all the collected nodes and we infer types for them
3. We merge user defined types with inferred types and add them to the composer
4. We add default resolvers for type fields, such as for `File` and `Date` fields
5. `setFieldsOnNodeType` is called and those fields are added to the types.
6. We create derived input objects, such as filter and sort and then create pagination types such as Connections
7. Root level resolvers are created for all node types
8. `createResolvers` api is called and resulting resolvers are added to the schema
9. We generate the schema

You can see the TODO LINK `packages/gatsby/schema/` folder in the schema= refactoring branch to learn more about the code.

# Further work

Those schema changes are just a first step. We want to add more control over the schema and more access to our internal APIs to our users. Our next step would be to add explicit types to the plugins that we maintain. We also want to let those plugins expose their internal APIs through the Model layer, like we did for our root Node API. This way one can reuse the functionality that is only available in plugins in their own resolvers.

We are super excited about those changes. As I mentioned, we really encourage you to try them TODO INSTRUCTIONS and send us feedback in TODO META ISSUE.
