---
date: "2021-11-30"
version: "4.3.0"
title: "v4.3 Release Notes"
---

Welcome to `gatsby@4.3.0` release (November 2021 #3)

Key highlights of this release:

- [Content Sync Improvement](#content-sync-improvements)
- [Use renderToPipeableStream React 18 API](#use-renderToPipeableStream-react-18-API)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.2)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@4.3.0-next.0...gatsby@4.3.0)

---

## Content Sync Improvements

## use-renderToPipeableStream-react-18-API

With React 18 beta, the new Server Side Rendering API is `renderToPipeableStream`. We have switched Gatsby to use it to be 100% compatible with react@beta and the latest react@alpha packages.

## Notable bugfixes & improvements

- `gatsby`: Don't retain logs in Gatsby Cloud, via [PR #34045](https://github.com/gatsbyjs/gatsby/pull/34045)
- `gatsby-source-shopify`: Fix peerDependencies for gatsby-plugin-image via [PR #34044](https://github.com/gatsbyjs/gatsby/pull/34044)
- `gatsby`: Reduce cost of sourcing after the initial, via [PR #33692](https://github.com/gatsbyjs/gatsby/pull/33692)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@4.3.0-next.0...gatsby@4.32.0) to this release 💜
