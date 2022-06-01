## ⚠️ This package is now deprecated

The `gatsby-plugin-graphql-config` package is now deprecated. Upgrade to Gatsby 4.15.0 to use [GraphQL Typegen](https://gatsbyjs.com/docs/how-to/local-development/graphql-typegen).

# gatsby-plugin-graphql-config

Persists Gatsby GraphQL schema and fragments to the `.cache` directory, as well as a [GraphQL Config](https://graphql-config.com) file to enable full-featured tooling for:

- [`vscode-graphql`](https://marketplace.visualstudio.com/items?itemName=Prisma.vscode-graphql), and other IDE extensions that use the official GraphQL LSP
- [`eslint-plugin-graphql`](https://github.com/apollographql/eslint-plugin-graphql)
- [`graphql code generator`](https://graphql-code-generator.com/) for Gatsby projects using TypeScript
- eventually [`graphiql`](https://github.com/graphql/graphiql) will use it, even!

## Install

```shell
npm install gatsby-plugin-graphql-config
```

## How to use

First, add it to your plugin configuration:

```javascript
// In your gatsby-config.js

plugins: [`gatsby-plugin-graphql-config`]
```

### Simplest setup

If you are able to configure your tools to seek a different `basePath` for loading GraphQL Config, point them to `.cache` directory.

### Manual setup for repositories with no other GraphQL projects

If your project is _only_ a Gatsby project, you can place a `graphql.config.js` file at the root of your Gatsby project like this:

```javascript
// <my project>/graphql.config.js

module.exports = require("./.cache/graphql.config.json")
```

If it's in a subdirectory such as a `site/` folder, you would use this:

```javascript
// <my project>/graphql.config.js

module.exports = require("./site/.cache/graphql.config.json")
```

### Manual setup for repositories with multiple GraphQL projects

If your repository has multiple GraphQL projects including Gatsby, you will want a config similar to this at the root:

```javascript
// <my project>/graphql.config.js

module.exports = {
  projects: {
    site: require("packages/site/.cache/graphql.config.json"),
    server: {
      schema: "packages/server/src/**/*.{graphql,gql}",
      documents: "packages/server/src/queries/**/*.{ts,tsx,js,jsx}",
    },
  },
}
```

### How it works

It writes out these files to the Gatsby `.cache` directory:

- `schema.graphql` - a complete representation of the schema, including plugins
- `fragments.graphql` - all user, plugin and gatsby-core provided fragments in one file
- `graphql.config.json` - a graphql-config@3 compatible config file with absolute file resolutions
