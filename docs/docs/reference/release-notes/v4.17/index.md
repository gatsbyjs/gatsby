---
date: "2022-06-21"
version: "4.17.0"
title: "v4.17 Release Notes"
---

Welcome to `gatsby@4.17.0` release (June 2022 #2)

Key highlights of this release:

- [JavaScript and CSS bundling performance improvements](#javascript-and-css-bundling-performance-improvements)
- [Incremental builds performance improvements](#incremental-builds-performance-improvements)
- [Open RFCs](#open-rfcs)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.16)

[Full changelog][full-changelog]

---

## JavaScript and CSS bundling performance improvements

We are constantly on the hunt for ways to make Gatsby faster and more reliable, and in this release we made a change that saw a **39% speed increase** in building production JavaScript and CSS bundles.

This was possible by ensuring that we only polyfill required modules based on your browserlist. For full details see [PR #35702](https://github.com/gatsbyjs/gatsby/pull/35702).

## Incremental builds performance improvements

Continuing the performance trend, we also adjusted the way we generate our content digest, resulting in fewer changed nodes and invalidated queries.

In our test case we found invalidated queries were reduced from **40k to 6k**, dramatically speeding up incremental builds. See [PR #33671](https://github.com/gatsbyjs/gatsby/pull/33671) for complete details.

## Open RFCs

We continue to have ongoing RFCs that we’d like your input on. Please give it a read, if applicable a try, and leave feedback!

- [Support for MDX v2](https://github.com/gatsbyjs/gatsby/discussions/25068): We are updating `gatsby-plugin-mdx` to be compatible with MDX v2. Keep a look out in the discussion for a canary to try!
- [Metadata Management API](https://github.com/gatsbyjs/gatsby/discussions/35841): We will be adding a built-in metadata management solution to Gatsby. Work is in progress and you can try out the canary now!

## Notable bugfixes & improvements

- `gatsby`:
  - Improve error message when engines try to bundle `ts-node`, via [PR #35762](https://github.com/gatsbyjs/gatsby/pull/35762)
  - Stabilize types output of GraphQL typegen, via [PR #35925](https://github.com/gatsbyjs/gatsby/pull/35925)
- `gatsby-source-drupal`: Fix not found image urls failing builds, via [PR #35855](https://github.com/gatsbyjs/gatsby/pull/35855)
- `gatsby-source-wordpress`: Refactor option check, via [PR #35827](https://github.com/gatsbyjs/gatsby/pull/35827)
- `gatsby-transformer-documentationjs`: Add support for JSX files, via [PR #35899](https://github.com/gatsbyjs/gatsby/pull/35899)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [chrispecoraro](https://github.com/chrispecoraro): Update gatsby-script.md [PR #35903](https://github.com/gatsbyjs/gatsby/pull/35903)
- [rutterjt](https://github.com/rutterjt): chore(docs): Add Jest 28 `jest-environment-jsdom` information [PR #35904](https://github.com/gatsbyjs/gatsby/pull/35904)
- [rudevdr](https://github.com/rudevdr): chore(docs): fix export.createPages to exports.CreatePages in documentation [PR #35874](https://github.com/gatsbyjs/gatsby/pull/35874)
- [febeling](https://github.com/febeling): chore(gatsby-source-drupal): Document fix for 406 [PR #35927](https://github.com/gatsbyjs/gatsby/pull/35927)
- [labifrancis](https://github.com/labifrancis): chore(docs): Add Gatsby Script component to "Adding Analytics" [PR #35839](https://github.com/gatsbyjs/gatsby/pull/35839)
- [tsdexter](https://github.com/tsdexter): refactor(gatsby-source-wordpress): move option check within relevant function to ensure enforcement [PR #35827](https://github.com/gatsbyjs/gatsby/pull/35827)
- [ElegantStack](https://github.com/ElegantStack): chore(docs): add options command to cli reference [PR #35815](https://github.com/gatsbyjs/gatsby/pull/35815)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.17.0-next.0...gatsby@4.17.0
