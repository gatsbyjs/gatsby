# gatsby-plugin-graphql-config

Persists gatsby graphql schema and fragments to the .cache directory, as well as a [graphql config](https://graphql-config.com) file to enable full-featured tooling for:

- [`vscode-graphql`](https://marketplace.visualstudio.com/items?itemName=Prisma.vscode-graphql), and other IDE extensions that use the official GraphQL LSP
- [`eslint-plugin-graphql`](https://github.com/apollographql/eslint-plugin-graphql)
- [`graphql code generator`](https://graphql-code-generator.com/) for gatsby projects using typescript
- eventually [`graphiql`](https://github.com/graphql/graphiql) will use it, even!

## Install

`npm install --save gatsby-plugin-graphql-config`

## How to use

First, add it to your plugin configuration:

```javascript
// In your gatsby-config.js
plugins: [`gatsby-plugin-graphql-config`]
```

**simplest setup**:
if you are able to configure your tools to seek a different `basePath` for loading graphql config, point them to `.cache` directory.

**manual setup for repos with no other graphql projects**:

If your project is _only_ a gatsby project, you can place a `graphql.config.js` file at the root of your gatsby project like this:

`<my project>/graphql.config.js`:

```js
// <my project>/graphql.config.js
module.exports = require("./.cache/graphql.config.json")
```

if it's in a subdirectory such as a `site/` folder, you would use this:

`<my project>/graphql.config.js`:

```js
module.exports = require("./site/.cache/graphql.config.json")
```

**for repositories with multiple graphql projects**

if your repository has multiple graphql projects including gatsby, you will want a config similar to this at the root:

`<my project>/graphql.config.js`:

```js
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

It writes out these files to the gatsby `.cache` directory:

- `schema.graphql` - a complete representation of the schema, including plugins
- `fragments.graphql` - all user, plugin and gatsby-core provided fragments in one file
- `graphql.config.json` - a graphql-config@3 compatible config file with absolute file resolutions
