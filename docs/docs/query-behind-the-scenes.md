---
title: How Queries Work
---

> This documentation isn't up to date with the latest version of Gatsby.
>
> Outdated areas are:
>
> - _links to source files_ need to be updated
>
> You can help by making a PR to [update this documentation](https://github.com/gatsbyjs/gatsby/issues/14228).

As part of Gatsby's data layer, GraphQL queries can be specified as tagged graphql expressions at the bottom of your component source file (e.g. [query for Gatsby frontpage](https://github.com/gatsbyjs/gatsby/blob/master/www/src/pages/index.js#L165)), StaticQueries within your components (e.g. [showcase site details](https://github.com/gatsbyjs/gatsby/blob/master/www/src/components/showcase-details.js#L103)), or fragments created by plugins (e.g. [gatsby-source-contentful](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-source-contentful/src/fragments.js)).

Note that this process only applies to queries that are specified directly in components or templates. It doesn't apply to queries involved in the creation of dynamic pages through your site's `gatsby-node.js` file (e.g. on [Gatsby's website](https://github.com/gatsbyjs/gatsby/blob/master/www/gatsby-node.js#L165)).

Almost all logic to do with queries is in the internal-plugin [query-runner](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby/src/internal-plugins/query-runner). There are two steps involved in a Query's life time. The first is extracting it, and the second is running it. These are separated into two bootstrap phases.

1. [Query Extraction](/docs/query-extraction/)
2. [Query Execution](/docs/query-execution/)
