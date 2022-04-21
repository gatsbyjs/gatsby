---
date: "2022-04-12"
version: "4.12.0"
title: "v4.12 Release Notes"
---

Welcome to `gatsby@4.12.0` release (April 2022 #1)

Key highlights of this release:

- [New RFCs](#new-rfcs)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.11)

[Full changelog][full-changelog]

---

## New RFCs

The Gatsby core team is running a collection of RFC's for new features coming to Gatsby. Please review the open RFC's and share your perspective to help us deliver the best possible experience for Gatsby developers, like you!

- [RFC for new Script component in Gatsby](https://github.com/gatsbyjs/gatsby/discussions/35404) - the script component will make it easier to incorporate 3rd party scripts without negatively impacting site performance
- [RFC for new Bundler in Gatsby](https://github.com/gatsbyjs/gatsby/discussions/35357) - Gatsby is evaluating other bundlers in order to deliver faster local development and production build speeds

## Notable bugfixes & improvements

- `gatsby`
  - Fix React 18 hydration with offline plugin via [PR #35319](https://github.com/gatsbyjs/gatsby/pull/35319)
  - Use gatsby root instead of `process.cwd()` when initializing cache via [PR #35263](https://github.com/gatsbyjs/gatsby/pull/35263)
  - Fix intermittent wrong sort results when sorting on materialized field via [PR #35271](https://github.com/gatsbyjs/gatsby/pull/35271)
  - Fix URL encoding issue with DSG urls via [PR #35336](https://github.com/gatsbyjs/gatsby/pull/35336)
  - Fix URL encoding issue with SSR urls via [PR #35346](https://github.com/gatsbyjs/gatsby/pull/35346)
- `create-gatsby`: Fix missing site title prompt via [PR #35272](https://github.com/gatsbyjs/gatsby/pull/35272)
- `gatsby-core-utils`: Fix exports map for importing from `dist` via [PR #35274](https://github.com/gatsbyjs/gatsby/pull/35274)
- `gatsby-plugin-sharp`: Handle slashes and `..` within paths for Windows via [PR #35246](https://github.com/gatsbyjs/gatsby/pull/35246)
- `gatsby-plugin-utils`: Fix path pieces being too long in image URLs and make url safely encoded via [PR #35160](https://github.com/gatsbyjs/gatsby/pull/35160)
- `gatsby-source-contentful`: Handle backreferences on data updates properly via [PR #35214](https://github.com/gatsbyjs/gatsby/pull/35214)
- `gatsby-source-wordpress`: Fix logic for matching image nodes via [PR #35324](https://github.com/gatsbyjs/gatsby/pull/35324)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [oneknucklehead](https://github.com/oneknucklehead): chore(babel-preset-gatsby): Updated README to include babel presets [PR #35069](https://github.com/gatsbyjs/gatsby/pull/35069)
- [me4502](https://github.com/me4502): fix(gatsby): ignore crawlers when prefetching [PR #35260](https://github.com/gatsbyjs/gatsby/pull/35260)
- [g00glen00b](https://github.com/g00glen00b): fix(gatsby-source-filesystem): use correct hash when using createFileNodeFromBuffer [PR #35243](https://github.com/gatsbyjs/gatsby/pull/35243)
- [jasonbosco](https://github.com/jasonbosco): chore(docs): Add Typesense as a search engine option [PR #35257](https://github.com/gatsbyjs/gatsby/pull/35257)
- [gmourier](https://github.com/gmourier): chore(docs): Fix Meilisearch spelling [PR #35275](https://github.com/gatsbyjs/gatsby/pull/35275)
- [BrunoAderaldo](https://github.com/BrunoAderaldo): chore(docs): typo in 4.11 release notes [PR #35349](https://github.com/gatsbyjs/gatsby/pull/35349)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.12.0-next.0...gatsby@4.12.0
