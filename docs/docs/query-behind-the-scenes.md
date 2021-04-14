---
title: How Queries Work
---

In Gatsby, GraphQL queries are specified as tagged `graphql` expressions. These can be exported in your page source files, used in the `StaticQuery` component, or used in the `useStaticQuery` hook in your React code. Plugins can also define fragments for use in queries.

Note that the process outlined in this section only applies to queries that are specified in components or templates. It does _not_ apply to queries specified in a `gatsby-node.js` file which are typically used for the creation of dynamic pages. (For an example of a query in a `gatsby-node.js` file, check out the [Creating Pages](/docs/tutorial/part-seven/#creating-pages) section from Part 7 of the Gatsby tutorial.

Most code to do with queries is in the [src/query](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby/src/query) directory in the Gatsby monorepo.

There are two steps involved in the lifetime of a GraphQL query in Gatsby. The first is extracting and validating it, and the second is running it.

1. [Query Extraction](/docs/query-extraction/)
2. [Query Execution](/docs/query-execution/)
