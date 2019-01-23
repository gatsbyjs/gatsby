---
title: How Queries Work
---

We're talking about GraphQL queries here. These can be tagged graphql expressions at the bottom of your component source file (e.g [query for Gatsby frontpage](https://github.com/gatsbyjs/gatsby/blob/master/www/src/pages/index.js#L225)), StaticQueries within your components (e.g [showcase site details](https://github.com/gatsbyjs/gatsby/blob/master/www/src/components/showcase-details.js#L103)), or fragments created by plugins (e.g [gatsby-source-contentful](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-contentful/src/fragments.js)).

Note that we are NOT talking about queries involved in the creation of your pages, which is usually performed in your site's gatsby-node.js (e.g [Gatsby's website](https://github.com/gatsbyjs/gatsby/blob/master/www/gatsby-node.js#L85)). We're only talking about queries that are tied to particular pages or templates.

Almost all logic to do with queries is in the internal-plugin [query-runner](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby/src/internal-plugins/query-runner). There are two steps involved in a Query's life time. The first is extracting it, and the second is running it. These are separated into two bootstrap phases.

1. [Query Extraction](/docs/query-extraction/)
2. [Query Execution](/docs/query-execution/)
