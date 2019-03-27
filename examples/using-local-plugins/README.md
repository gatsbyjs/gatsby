# Using a local plugin

This example demonstrates usage of a local plugin -- in this case a source plugin.

You might also be interested in the docs section on [local plugins](/docs/how-plugins-work/#local-plugins), or the [source plugin tutorial](/docs/source-plugin-tutorial/).

## Using Gatsby's GraphQL integration layer

This example site is also intended as a direct comparison to the [using-unstructured-data example](../using-unstructured-data), which illustrates how to use an "unstructured data" approach (or, without making use of the GraphQL integration layer).

## Sourcing data using a local plugin

This example uses a [local plugin](https://www.gatsbyjs.org/docs/plugins/#loading-plugins-from-your-local-plugins-folder) to:

1. Load data from the PokéAPI’s REST endpoints
2. Process that data into Gatsby's node format
3. Use the [`createNode` action](https://www.gatsbyjs.org/docs/actions/#createNode) to add the data to Gatsby’s GraphQL layer

The [`gatsby-node.js` file](https://github.com/jlengstorf/gatsby-with-unstructured-data/blob/using-gatsby-data-layer/plugins/gatsby-source-pokeapi/gatsby-node.js) of the local plugin includes detailed comments on the process.
