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

The createNodeManifest action gets a performance boost.

We no longer hash page-data.json files and include that hash in node manifest files in order to determine if that page-data has deployed. Instead we include the manifest id passed to createNodeManifest within the page-data file as a more performant way to check if the corresponding data for a data update has deployed and become publicly available online. This allows us to create more node manifest files than before, making services such as Content Sync more reliable, in more situations.

We've also added a new updatedAtUTC argument to the action, passing a date here allows Gatsby to determine wether or not the node manifest file should be created or not. If the date is older than 30 days (by default) the node manifest will not be created. Users can change this default by setting the `NODE_MANIFEST_MAX_DAYS_OLD` environment variable to any number of days.

## Use renderToPipeableStream React 18 API

Gatsby switched to `renderToPipeableStream` instead of `pipeToNodeWritable` from older React 18 alpha versions. Now with React 18 beta and the new alphas `renderToPipeableStream` is the recommend API for Server Side Rendering.

## Notable bugfixes & improvements

- `gatsby`: Don't retain logs in Gatsby Cloud, via [PR #34045](https://github.com/gatsbyjs/gatsby/pull/34045)
- `gatsby-source-shopify`: Fix peerDependencies for gatsby-plugin-image via [PR #34044](https://github.com/gatsbyjs/gatsby/pull/34044)
- `gatsby`: Reduce cost of sourcing after the initial, via [PR #33692](https://github.com/gatsbyjs/gatsby/pull/33692)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@4.3.0-next.0...gatsby@4.3.0) to this release 💜

- [laurenskling](https://github.com/laurenskling): fix(gatsby-source-graphql): Use default export from node-fetch [PR #33977](https://github.com/gatsbyjs/gatsby/pull/33977)
- [SaloniThete](https://github.com/SaloniThete)
  - chore(docs): Typo in docs/processing-payments-with-square [PR #34001](https://github.com/gatsbyjs/gatsby/pull/34001)
  - chore(examples): Typo in creating-source-plugins [PR #34000](https://github.com/gatsbyjs/gatsby/pull/34000)
  - chore(examples):Typo in functions-google-oauth/README [PR #34005](https://github.com/gatsbyjs/gatsby/pull/34005)
- [gabxyz](https://github.com/gabxyz): chore(gatsby): add `getCache` helper to `NodePluginArgs` [PR #33984](https://github.com/gatsbyjs/gatsby/pull/33984)
- [ashhitch](https://github.com/ashhitch): chore(gatsby): Add `getServerData` to PageProps type [PR #34003](https://github.com/gatsbyjs/gatsby/pull/34003)
- [buzinas](https://github.com/buzinas): fix(gatsby-plugin-manifest): Delete `cacheDigest` from generated webmanifest [PR #33966](https://github.com/gatsbyjs/gatsby/pull/33966)
- [pranav0281999](https://github.com/pranav0281999): feat(gatsby-plugin-nprogress): Replace `nprogress` with `accessible-nprogress` [PR #34038](https://github.com/gatsbyjs/gatsby/pull/34038)
- [apotheosistech](https://github.com/apotheosistech): Bump timeout from 15s to 30s [PR #34035](https://github.com/gatsbyjs/gatsby/pull/34035)
- [obax](https://github.com/obax): chore(docs): Update webpack fs resolution [PR #34056](https://github.com/gatsbyjs/gatsby/pull/34056)
- [axe312ger](https://github.com/axe312ger): chore(gatsby-source-contentful): Add note to Rich Text docs [PR #34083](https://github.com/gatsbyjs/gatsby/pull/34083)
- [joernroeder](https://github.com/joernroeder): fix(gatsby-transformer-json): Fix high memory consumption [PR #34084](https://github.com/gatsbyjs/gatsby/pull/34084)
- [arthuranteater](https://github.com/arthuranteater): chore(docs): Add missing permission for Shopify Admin API [PR #34091](https://github.com/gatsbyjs/gatsby/pull/34091)
