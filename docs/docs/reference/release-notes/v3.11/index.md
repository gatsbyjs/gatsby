---
date: "2021-08-03"
version: "3.11.0"
title: "v3.11 Release Notes"
---

Welcome to `gatsby@3.11.0` release (August 2021 #1)

Key highlights of this release:

- [Improvements to Parallel Query Running](#improvements-to-parallel-query-running) - Better performance and more configurable

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.10)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.11.0-next.0...gatsby@3.11.0)

---

## Improvements to Parallel Query Running

In case you missed it, in [3.10](/docs/reference/release-notes/v3.10) we've added experimental support for Parallel Query Running. Depending on your site you will see dramatic improvements in `gatsby build` performance. We've moved more information [into LMDB](https://github.com/gatsbyjs/gatsby/pull/32431), fixed a [bug](https://github.com/gatsbyjs/gatsby/pull/32520) and [optimized](https://github.com/gatsbyjs/gatsby/pull/32440) how we merge the state of the workers. You can also force the chunk size for each worker now by setting the `GATSBY_PARALLEL_QUERY_CHUNK_SIZE` environment variable.

To learn more about Parallel Query Running head to the [previous release notes](/docs/reference/release-notes/v3.10/#experimental-parallel-query-running).

Please give it a try and report back in the [PQR GitHub Discussion](https://github.com/gatsbyjs/gatsby/discussions/32389). We really appreciate any feedback!

## Notable bugfixes & improvements

- `gatsby`: Display message about unfit flags found in `gatsby-config.js` per [PR #32394](https://github.com/gatsbyjs/gatsby/pull/32394)
- `gatsby`: Correct pagination logic (fixing a regression) per [PR #32496](https://github.com/gatsbyjs/gatsby/pull/32496)
- `gatsby-source-shopify`: Add a query for `ShopifyLocation` and `ShopifyInventoryLevel` per [PR #32450](https://github.com/gatsbyjs/gatsby/pull/32450)
- `gatsby-plugin-mdx`: Performance improvement for a specific usage scenario (multiple GraphQL fields that require MDX processing) per [PR #32462](https://github.com/gatsbyjs/gatsby/pull/32462)
- `gatsby-source-wordpress`: Fetch referenced media items during single node updates per [PR #32381](https://github.com/gatsbyjs/gatsby/pull/32381)
- `gatsby-plugin-gatsby-cloud`: Fix bug where Incremental Builds on Gatsby Cloud would result in downloading duplicate JavaScript assets per [PR #32535](https://github.com/gatsbyjs/gatsby/pull/32535)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.11.0-next.0...gatsby@3.11.0) to this release 💜

- [angeloashmore](https://github.com/angeloashmore): fix(gatsby): correct hasNextPage pagination info when resultOffset is provided [PR #32319](https://github.com/gatsbyjs/gatsby/pull/32319)
- [jvidalv](https://github.com/jvidalv): chore(docs): modified file-mock path for typescript config on unit-te… [PR #32390](https://github.com/gatsbyjs/gatsby/pull/32390)
- [kik-o](https://github.com/kik-o): chore(docs): SEO remove typos & outdated information [PR #32433](https://github.com/gatsbyjs/gatsby/pull/32433)
- [farhan443](https://github.com/farhan443): chore(docs): Fix a minor typo "with" > "will" [PR #32491](https://github.com/gatsbyjs/gatsby/pull/32491)
- [nyedidikeke](https://github.com/nyedidikeke): chore(docs): Fix typo in documentation for assetPrefix [PR #32499](https://github.com/gatsbyjs/gatsby/pull/32499)
- [xugetsu](https://github.com/xugetsu): chore(docs): Fix typo in File System Route API doc [PR #32517](https://github.com/gatsbyjs/gatsby/pull/32517)
