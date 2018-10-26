# Using Gatsby's GraphQL integration layer

This branch uses Gatsby's GraphQL integration layer. It's intended as a useful comparison to the [master branch](https://github.com/jlengstorf/gatsby-with-unstructured-data/tree/master) of this repo, which illustrates how to use Gatsby "unstructured data" (or, without making use of the GraphQL integration layer).

## Sourcing data using a local plugin

This example uses a [local plugin](https://www.gatsbyjs.org/docs/plugins/#loading-plugins-from-your-local-plugins-folder) to:

1. Load data from the PokéAPI’s REST endpoints
2. Process that data into Gatsby's node format
3. Use the [`createNode` action](https://www.gatsbyjs.org/docs/actions/#createNode) to add the data to Gatsby’s GraphQL layer

The [`gatsby-node.js` file](https://github.com/jlengstorf/gatsby-with-unstructured-data/blob/using-gatsby-data-layer/plugins/gatsby-source-pokeapi/gatsby-node.js) of the local plugin includes detailed comments on the process.

## Querying data in templates from local GraphQL server

Once the data is successfully available from the local GraphQL server (via the process above), React components in a Gatsby site can query against that local GraphQL server to build your pages.

Each page template from the master branch (for example, [`all-pokemon.js`](https://github.com/jlengstorf/gatsby-with-unstructured-data/blob/master/src/templates/all-pokemon.js)) has a [corresponding file in this branch](https://github.com/jlengstorf/gatsby-with-unstructured-data/blob/using-gatsby-data-layer/src/templates/all-pokemon.js) showing the GraphQL approach.

Compare and contrast!
