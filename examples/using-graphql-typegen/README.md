# using-graphql-typegen

Example project for the documentation page [GraphQL Typegen](https://gatsbyjs.com/docs/how-to/local-development/graphql-typegen).

## Getting Started

Install dependencies:

```shell
npm install --legacy-peer-deps
```

Run the development server:

```shell
npm run develop
```

Afterwards you'll see new files at `src/gatsby-types.d.ts` and inside the `.cache/typegen` folder. You can now also run ESLint (with `npm run lint`). If you have VSCode installed with the [GraphQL extension](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql) you can get autocompletion inside VSCode itself for an query (you'll need to run `gatsby develop` for this to work). You can access the global namespace `Queries` to type your query responses.
