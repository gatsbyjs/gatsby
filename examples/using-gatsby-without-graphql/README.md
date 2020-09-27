# Using Gatsby without GraphQL

Many examples in the Gatsby docs focus on using source plugins to pull data into Gatsby's GraphQL data layer. But you don’t need to use source plugins (or create Gatsby nodes) to pull data into a Gatsby site! This example uses "unstructured data", or data "handled outside of the Gatsby data layer". It uses the data directly, and does not transform the data into Gatsby nodes.

This example loads data from the [PokéAPI](https://www.pokeapi.co/)’s REST endpoints, then creates pages (and nested pages) using [Gatsby’s `createPages` API](https://www.gatsbyjs.com/docs/node-apis/#createPages).

You might also be interested in this [blog post on unstructured data](/docs/blog/2018-10-25-using-gatsby-without-graphql/index.md), or the relevant [docs page](https://www.gatsbyjs.com/docs/using-gatsby-without-graphql/).

## What would this look like using Gatsby's GraphQL integration layer?

This example site is also intended as a direct comparison to the [using-local-plugins](../using-local-plugins) example, which take the exact same example, but shows how to use Gatsby's GraphQL layer, instead of using "unstructured data" (without GraphQL).
