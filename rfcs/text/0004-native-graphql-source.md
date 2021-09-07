- Start Date: 2018-07-09
- RFC PR: (leave this empty)
- Gatsby Issue: (leave this empty)

# Summary

This RFCs proposes the way to add third-party GraphQL schemas into Gatsby core schema. In addition to a low-level API to add schemas to be stitched, it describes a higher-level API/plugin to integrate third-party APIs into your Gatsby API.

- [Implementation](https://github.com/gatsbyjs/gatsby/tree/graphql/schema-stitching)
- [Simple example project](https://github.com/freiksenet/gatsby-github-displayer)

# Basic example

Plugin API:

```js
// In your gatsby-config.js
module.exports = {
  plugins: [
    // Simple config, passing URL
    {
      resolve: "gatsby-source-graphql",
      options: {
        // This type will contain remote schema Query type
        typeName: "SWAPI",
        // This is field under which it's accessible
        fieldName: "swapi",
        // Url to query from
        url: "https://api.graphcms.com/simple/v1/swapi",
      },
    },
    // Passing parameters (passed to apollo-link)
    {
      resolve: "gatsby-source-graphql",
      options: {
        typeName: "GitHub",
        fieldName: "github",
        // Url to query from
        url: "https://api.github.com/graphql",
        // HTTP headers
        headers: {
          Authorization: "bearer <GITHUB_TOKEN>",
        },
        // Additional options to pass to node-fetch
        fetchOptions: {},
      },
    },
    // Creating arbitrary Apollo Link (for advanced situations)
    {
      resolve: "gatsby-source-graphql",
      options: {
        typeName: "GitHub",
        fieldName: "github",
        // Create Apollo Link manually. Can return a Promise.
        createLink: (pluginOptions) => {
          return createHttpLink({
            uri: 'https://api.github.com/graphql',
            headers: {
              'Authorization': `bearer ${process.env.GITHUB_TOKEN}`,
            },
            fetch,
          })
      },
    },
  ],
}
```

Querying it

```graphql
{
  # Field name parameter defines how you can access third party api
  swapi {
    allSpecies {
      name
    }
  }
  github {
    viewer {
      email
    }
  }
}
```

Low-level Gatsby API for future plugins

```js
exports.sourceNodes = async ({ boundActionCreators }) => {
  const { addThirdPartySchema } = boundActionCreators
  addThirdPartySchema(yourGraphQLJSExecutableSchema)
})
```

# Motivation

When Gatsby started, there weren't that many GraphQL APIs in the wild. Nowadays, not only there are many public GraphQL APIs, but also many people have their own internal GraphQL API. Tools like Prisma and AWS Appsync are increasingly popular. As Gatsby uses GraphQL, it's weird that there is no native way to use those plugin schemas. Currently one needs to create a custom source plugin for every GraphQL API.

This RFCs proposes the way to automatically merge Gatsby schema with third-party APIs. In addition, it provides a simple to use plugin to do that, that should cover most of the use cases.

Low-level API should also enable a more deep customization of Gatsby Schemas, by exposing almost full power of graphql-tools schema-stitching. This probably will allow more advanced tools that replace or modify some built-in types.

# Detailed design

## Action Creator

`addThirdPartySchema(schema: GraphQLSchema)`

Adds a schema to third-party schema list. At schema creation time all the schemas are merged with [schema stitching](https://www.apollographql.com/docs/graphql-tools/schema-stitching.html)

## gatsby-source-graphql

This is a higher level plugin. Instead of just merging a schema, it allows a more simple way of merging an third-party GraphQL API into the Gatsby schema. It also handles namespacing, both on type and field level. Features:

- Merge in a GraphQL Schema from an API. Schema can be automatically introspected or provided through a callback.
- In case of introspection, schema is cached.
- Connection parameters can provided both in simplified form (`url` and `params`) or by providing a callback that creates `apollo-link`
- Namespace all types in the schema
- Put schema's Query type under a specified `fieldName` as an object type with a `typeName`. This means the third-party schema won't be pollute the main Gatsby namespace or conflict with it.

### Options

- `typeName: string` (required) - type to put third-party schema's Query type into
- `fieldName: string` (required) - field into which Gatsby's third-party API will be added
- `url: string?` - url of a third-party service
- `headers: object?` - headers to add to the request
- `fetchOptions: object?` - additional `node-fetch` options
- `createLink: (options: object) => ApolloLink` - a callback that will create an ApolloLink instance that should query the third-party API. An escape hatch that overrides `url`, `headers` and `fetchOptions` parameters above and allows complex logic for e.g. authorization
- `createSchema: (options: object) => GraphQLSchema` - callback that will create a GraphQLSchema of a third-party API. Resolvers are going to be ignored. This allows not using introspection (e.g. if it's disabled) or to customize third-party schema before passing it to stitching

Either `url` or `createLink` must be specified. If no `createSchema` is passed, third-party schema must support introspection.

# Drawbacks

Schema stitching takes additional time, so schema creation time will increase.

# Alternatives

Keep writing custom plugins for each GraphQL API.

Alternatively, one can write a plugin that converts a third-party GraphQL schema into Gatsby nodes. My evaluation is that it's going to be more complex at the end.

One could consider a more higher-level API for adding third-party schemas, instead of a current very low-level one. However, as we don't yet know all the possible use cases with this, I'd err on being too low level.

# Adoption strategy

This plugin doesn't remove or change APIs, only adds new ones. Should be backwards compatible. Possibly, existing GraphQL plugins should eventually be deprecated in favor of using this one directly.

# How we teach this

This adds one function to plugin API and one new source plugin. This source plugin should be introduced to people who use GraphQL in the documentation. There also should be a blog post and some tutorial projects using this.

# Unresolved questions

Integration with Gatsby incremental builds. Current ideas is incremental approach - first the whole third-party API will be considered one Node, then we'll add callbacks to allow creating nodes from third-party APIs.
