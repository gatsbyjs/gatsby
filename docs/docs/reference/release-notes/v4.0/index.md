---
date: "2021-10-21"
version: "4.0.0"
title: "v4 Release Notes"
---

Welcome to `gatsby@4.0.0` release (October 2021 #1).

We've released Gatsby 3 in [March 2021](/docs/reference/release-notes/v3.0) and now have a lot of exciting new features for Gatsby 4!
We’ve tried to make migration smooth. Please refer to the [migration guide](/docs/reference/release-notes/migrating-from-v3-to-v4/)
and [let us know](https://github.com/gatsbyjs/gatsby/issues/new/choose) if you encounter any issues when migrating.

Key highlights of this release:

- [Parallel Query Running](#parallel-query-running) - up to 40% reduction in build times
- [Deferred Static Generation (DSG)](#deferred-static-generation-dsg) - defer page generation to user request, speeding up build times
- [Server-Side Rendering (SSR)](#server-side-rendering-ssr) - pre-render a page with data that is fetched when a user visits the page

Major dependency updates:

- [Node 14](#node-14)

Also check out [notable bugfixes and improvements](#notable-bugfixes-and-improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes for 3.14](/docs/reference/release-notes/v3.14)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.14.0-next.0...gatsby@4.0.0)

## Breaking Changes

If you're looking for an overview of all breaking changes and how to migrate, please see the [migrating from v3 to v4 guide](/docs/reference/release-notes/migrating-from-v3-to-v4/).

## Parallel Query Running

TODO

## Deferred Static Generation (DSG)

TODO

## Server-Side Rendering (SSR)

TODO

## Node 14

We are dropping support for Node 12 as a new underlying dependency (`lmdb-store`) is requiring `>=14.15.0`. See the main changes in [Node 14 release notes](https://nodejs.org/en/blog/release/v14.0.0/).

Check [Node’s releases document](https://github.com/nodejs/Release#nodejs-release-working-group) for version statuses.

## Pages Output in CLI

![CLI showing an overview of all pages. Pages that are DSG are marked with a "D", SSR pages are marked with a "∞" and Gatsby Functions are marked with a "λ". All other pages are SSG.](./build-page-tree.jpg)

## Notable bugfixes and improvements

- `gatsby`: Reduce page-renderer size, via [PR #33051](https://github.com/gatsbyjs/gatsby/pull/33051)
- `gatsby`: Add queue to prefetch, making it less eage. Via [PR #33530](https://github.com/gatsbyjs/gatsby/pull/33530)
- `gatsby-source-wordpress`: Use `gatsby-plugin-image`, via [PR #33138](https://github.com/gatsbyjs/gatsby/pull/33138)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.14.0-next.0...gatsby@4.0.0) to this release 💜
