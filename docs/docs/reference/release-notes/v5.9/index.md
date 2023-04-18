---
date: "2023-04-18"
version: "5.9.0"
title: "v5.9 Release Notes"
---

Welcome to `gatsby@5.9.0` release (April 2023 #1)

Key highlights of this release:

- [Performance improvements](#performance-improvements)
- [New "Creating a Source Plugin" tutorial](#new-creating-a-source-plugin-tutorial)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v5.8)

[Full changelog][full-changelog]

---

## Performance improvements

We have shipped some great performance improvements to `gatsby` and `gatsby-source-contentful`.

- With [PR #37780](https://github.com/gatsbyjs/gatsby/pull/37780) we no longer block the event loop during [schema inference](/docs/reference/graphql-data-layer/schema-customization/#automatic-type-inference) and allow garbage collection to work better. This dropped the "building schema" step of a large test site by 27%.
- In [PR #37782](https://github.com/gatsbyjs/gatsby/pull/37782) we've added a new public action called [`enableStatefulSourceNodes`](/docs/reference/config-files/actions/#enableStatefulSourceNodes). This will stop Gatsby from checking for stale nodes created by the source plugin that called the action. When enabling stateful sourcing plugin authors need to be sure their plugins properly handle deleting nodes when they need to be deleted. Since Gatsby is no longer checking for node staleness, data which should no longer exist could stick around. Be sure to read the [opting out of stale node deletion](/docs/node-creation/#opting-out-of-stale-node-deletion) documentation.
- Lastly, in [PR #37910](https://github.com/gatsbyjs/gatsby/pull/37910) the memory usage of `gatsby-source-contentful` was further decreased. This was achieved by further unblocking the event loop through a queue, allowing more garbage collection, and an improved way of storing intermediate information for backreferences.

All in all these improvements enabled a Contentful test site of ours (with 4.9 million nodes) to build with 24GB of RAM (instead of 64GB), 27% decrease in "building schema" step, and around 70% faster data updates.

## New "Creating a Source Plugin" tutorial

A new tutorial for [Creating a Source Plugin from scratch](/docs/tutorial/creating-a-source-plugin/) is available now!

Gatsby’s data layer is one of the key features and an enabler for composable architectures. One of the key driving forces of Gatsby since its beginning has been its [800+ source plugins](/plugins?=gatsby-source-). These plugins make it easy to connect and source from every data source you could imagine.

While our documentation always had a guide on how to create a source plugin, the content was dense and at times difficult to follow. It didn’t show how easy it is to create a barebones source plugin and how many additional features you could add. We wanted to make it easier for users and customers alike to create their own source plugins.

Read the [launch blog post](/blog/announcing-new-source-plugin-tutorial) to learn more.

## Notable bugfixes & improvements

- We merged over 60 [renovate](https://www.mend.io/free-developer-tools/renovate/) PRs to update dependencies across various packages. If you're curious about the changes, you can use [this GitHub search](https://github.com/gatsbyjs/gatsby/pulls?q=is%3Apr+sort%3Aupdated-desc+author%3Aapp%2Frenovate+merged%3A2023-04-03..2023-04-04).
- `gatsby-plugin-sharp`: **Security update**. Don't serve static assets through lazy images, via [PR #37796](https://github.com/gatsbyjs/gatsby/pull/37796). [CVE](https://github.com/gatsbyjs/gatsby/security/advisories/GHSA-h2pm-378c-pcxx).
- `gatsby`:
  - Make `___NODE` convention warning less noisy, via [PR #37781](https://github.com/gatsbyjs/gatsby/pull/37781)
  - Add new [`enableStatefulSourceNodes`](/docs/reference/config-files/actions/#enableStatefulSourceNodes) action, via [PR #37782](https://github.com/gatsbyjs/gatsby/pull/37782). [Learn more](/docs/node-creation/#opting-out-of-stale-node-deletion).
  - Correct argument order for `onPreRouteUpdate`, via [PR #30339](https://github.com/gatsbyjs/gatsby/pull/30339)
  - Reduce size of SSR/DSG engine, via [PR #37764](https://github.com/gatsbyjs/gatsby/pull/37764)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [StephenCleary](https://github.com/StephenCleary): fix(gatsby): Fix argument order for `onPreRouteUpdate` [PR #30339](https://github.com/gatsbyjs/gatsby/pull/30339)
- [Talaxy009](https://github.com/Talaxy009): fix(gatsby): Validate sub plugins options [PR #37804](https://github.com/gatsbyjs/gatsby/pull/37804)
- [axe312ger](https://github.com/axe312ger): fix(gatsby): move typing for `enableStatefulSourceNodes` into `Actions` [PR #37933](https://github.com/gatsbyjs/gatsby/pull/37933)
- [benomatis](https://github.com/benomatis)
  - chore(docs): Typo in Hosting and Data Source Integrations [PR #37793](https://github.com/gatsbyjs/gatsby/pull/37793)
  - chore(docs): correct redundant closing brackets in adding-analytics.md [PR #37803](https://github.com/gatsbyjs/gatsby/pull/37803)
- [geocine](https://github.com/geocine): chore(gatsby-plugin-feed): Update README with clearer instructions [PR #37930](https://github.com/gatsbyjs/gatsby/pull/37930)
- [jgjgill](https://github.com/jgjgill): chore(gatsby-remark-autolink-headers): Fix typo in README [PR #37812](https://github.com/gatsbyjs/gatsby/pull/37812)
- [rogermparent](https://github.com/rogermparent): fix(gatsby-plugin-page-creator): Find nested files for knownCollections [PR #37762](https://github.com/gatsbyjs/gatsby/pull/37762)
- [tmastrom](https://github.com/tmastrom): chore(docs): update broken relay compiler link [PR #37813](https://github.com/gatsbyjs/gatsby/pull/37813)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@5.9.0-next.0...gatsby@5.9.0
