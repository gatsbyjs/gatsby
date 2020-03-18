# gatsby-source-graphql

Plugin for connecting arbitrary GraphQL APIs to Gatsby's GraphQL. Remote schemas are stitched together by declaring an arbitrary type name that wraps the remote schema Query type (`typeName` below), and putting the remote schema under a field of the Gatsby GraphQL query (`fieldName` below).

- [Example website](https://using-gatsby-source-graphql.netlify.com/)
- [Example website source](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-gatsby-source-graphql)

## Install

`npm install --save gatsby-source-graphql`

## How to use

If the remote GraphQL API needs authentication, you should pass environment variables to the build process, so credentials aren't committed to source control. We recommend using [`dotenv`][dotenv], which will then expose environment variables. [Read more about dotenv and using environment variables here][envvars]. Then we can _use_ these environment variables via `process.env` and configure our plugin.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    // Simple config, passing URL
    {
      resolve: "gatsby-source-graphql",
      options: {
        // Arbitrary name for the remote schema Query type
        typeName: "SWAPI",
        // Field under which the remote schema will be accessible. You'll use this in your Gatsby query
        fieldName: "swapi",
        // Url to query from
        url: "https://api.graphcms.com/simple/v1/swapi",
      },
    },

    // Advanced config, passing parameters to apollo-link
    {
      resolve: "gatsby-source-graphql",
      options: {
        typeName: "GitHub",
        fieldName: "github",
        url: "https://api.github.com/graphql",
        // HTTP headers
        headers: {
          // Learn about environment variables: https://gatsby.dev/env-vars
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
        // HTTP headers alternatively accepts a function (allows async)
        headers: async () => {
          return {
            Authorization: await getAuthorizationToken(),
          }
        },
        // Additional options to pass to node-fetch
        fetchOptions: {},
      },
    },

    // Advanced config, using a custom fetch function
    {
      resolve: "gatsby-source-graphql",
      options: {
        typeName: "GitHub",
        fieldName: "github",
        url: "https://api.github.com/graphql",
        // A `fetch`-compatible API to use when making requests.
        fetch: (uri, options = {}) =>
          fetch(uri, { ...options, headers: sign(options.headers) }),
      },
    },

    // Complex situations: creating arbitrary Apollo Link
    {
      resolve: "gatsby-source-graphql",
      options: {
        typeName: "GitHub",
        fieldName: "github",
        // Create Apollo Link manually. Can return a Promise.
        createLink: pluginOptions => {
          return createHttpLink({
            uri: "https://api.github.com/graphql",
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            },
            fetch,
          })
        },
      },
    },
  ],
}
```

## How to Query

```graphql
{
  # This is the fieldName you've defined in the config
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

## Schema definitions

By default, the schema is introspected from the remote schema. The schema is cached in the `.cache` directory, and refreshing the schema requires deleting the cache (e.g. by restarting `gatsby develop`).

To control schema consumption, you can alternatively construct the schema definition by passing a `createSchema` callback. This way you could, for example, read schema SDL or introspection JSON. When the `createSchema` callback is used, the schema isn't cached. `createSchema` can return a GraphQLSchema instance, or a Promise resolving to one.

```js
const fs = require("fs")
const { buildSchema, buildClientSchema } = require("graphql")

module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-graphql",
      options: {
        typeName: "SWAPI",
        fieldName: "swapi",
        url: "https://api.graphcms.com/simple/v1/swapi",

        createSchema: async () => {
          const json = JSON.parse(
            fs.readFileSync(`${__dirname}/introspection.json`)
          )
          return buildClientSchema(json.data)
        },
      },
    },
    {
      resolve: "gatsby-source-graphql",
      options: {
        typeName: "SWAPI",
        fieldName: "swapi",
        url: "https://api.graphcms.com/simple/v1/swapi",

        createSchema: async () => {
          const sdl = fs.readFileSync(`${__dirname}/schema.sdl`).toString()
          return buildSchema(sdl)
        },
      },
    },
  ],
}
```

# Refetching data

By default, `gatsby-source-graphql` will only refetch the data once the server is restarted. It's also possible to configure the plugin to periodically refetch the data. The option is called `refetchInterval` and specifies the timeout in seconds.

```js
module.exports = {
  plugins: [
    // Simple config, passing URL
    {
      resolve: "gatsby-source-graphql",
      options: {
        // Arbitrary name for the remote schema Query type
        typeName: "SWAPI",
        // Field under which the remote schema will be accessible. You'll use this in your Gatsby query
        fieldName: "swapi",
        // Url to query from
        url: "https://api.graphcms.com/simple/v1/swapi",

        // refetch interval in seconds
        refetchInterval: 60,
      },
    },
  ],
}
```

[dotenv]: https://github.com/motdotla/dotenv
[envvars]: https://gatsby.dev/env-vars
