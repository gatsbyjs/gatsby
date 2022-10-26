---
date: "2021-11-16"
version: "4.2.0"
title: "v4.2 Release Notes"
---

Welcome to `gatsby@4.2.0` release (November 2021 #2)

Key highlights of this release:

- [`gatsby-source-contentful` v7](#gatsby-source-contentful-v7)
- [`getServerData` improvements](#getserverdata-improvements)
- [Framework Version Support](#framework-version-support)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.1)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@4.2.0-next.0...gatsby@4.2.0)

---

## `gatsby-source-contentful` v7

We're releasing a new major version of `gatsby-source-contentful` as the support for `gatsby-image` is dropped in favour fo the superior successor [`gatsby-plugin-image`](/docs/reference/built-in-components/gatsby-plugin-image/). Read the [Migrating from gatsby-image to gatsby-plugin-image](/docs/reference/release-notes/image-migration-guide/) guide to learn more. The [PR #33528](https://github.com/gatsbyjs/gatsby/pull/33528) implemented this change.

You can also use `AVIF` images with Contentful now as the [PR #33903](https://github.com/gatsbyjs/gatsby/pull/33903) added support for this image format -- use the new `gatsby-plugin-image` to use it.

## `getServerData` improvements

A couple of improvements were made to the new [Server-Side Rendering API](/docs/reference/rendering-options/server-side-rendering/) inside Gatsby:

- The response headers are now also applied during `gatsby develop`, via [PR #33810](https://github.com/gatsbyjs/gatsby/pull/33810)
- You can (and should) use `process.env.*` environment variables inside `getServerData`, via [PR #33690](https://github.com/gatsbyjs/gatsby/pull/33690)
- The status code returned by `getServerData` is respected now, via [PR #33914](https://github.com/gatsbyjs/gatsby/pull/33914). Please use this syntax (see [reference guide](/docs/reference/rendering-options/server-side-rendering/#creating-server-rendered-pages)):

  ```js
  export async function getServerData() {
    return {
      status: 200,
      headers: {},
      props: {},
    }
  }
  ```

## Framework Version Support

You can find the support plans for the major versions of Gatsby on the newly created page [Gatsby Framework Version Support](/docs/reference/release-notes/gatsby-version-support/).

## Notable bugfixes & improvements

- A lot of internal dependency updates to each package, e.g. bumping `sharp` to `0.29.2`. You can check the `CHANGELOG.md` file in each package's folder for the details
- `gatsby`: Test files inside the `src/api` (Gatsby Functions) directory are now excluded by default, via [PR #33834](https://github.com/gatsbyjs/gatsby/pull/33834)
- `gatsby-source-wordpress`:
  - Fix for `'createRoot' is not exported from 'react-dom' (imported as 'ReactDOM').` warning, via [PR #33991](https://github.com/gatsbyjs/gatsby/pull/33991)
  - Hydrate images in develop on first occurrence, via [PR #33989](https://github.com/gatsbyjs/gatsby/pull/33989)
- `gatsby-core-utils`: Add retry on HTTP status codes to `fetchRemoteFile`, via [PR #33461](https://github.com/gatsbyjs/gatsby/pull/33461)
- Content Sync:
  - Content Sync is a Gatsby Cloud feature for improving the Preview experience for content authors. You can read more about it in the [conceptual guide](/docs/conceptual/content-sync/)
  - `gatsby-source-drupal` is prepared for Content Sync, via [PR #33683](https://github.com/gatsbyjs/gatsby/pull/33683)
  - Update the [Creating Pages documentation](/docs/creating-and-modifying-pages/#optimizing-pages-for-content-sync), via [PR #33848](https://github.com/gatsbyjs/gatsby/pull/33848)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@4.2.0-next.0...gatsby@4.2.0) to this release 💜

- [shreemaan-abhishek](https://github.com/shreemaan-abhishek): chore(docs): fix issues in 0009-telemetry RFC [PR #33829](https://github.com/gatsbyjs/gatsby/pull/33829)
- [tonyhallett](https://github.com/tonyhallett)
  - fix(gatsby): Reuse readPageData [PR #33595](https://github.com/gatsbyjs/gatsby/pull/33595)
  - chore(gatsby): Update inference-metadata type [PR #33839](https://github.com/gatsbyjs/gatsby/pull/33839)
  - fix(gatsby): TS type for `createTypes` action arrays [PR #33588](https://github.com/gatsbyjs/gatsby/pull/33588)
  - chore(gatsby): Correct fromNode TS type [PR #33912](https://github.com/gatsbyjs/gatsby/pull/33912)
- [jstramel](https://github.com/jstramel): searcParams missing from urls [PR #33861](https://github.com/gatsbyjs/gatsby/pull/33861)
- [axe312ger](https://github.com/axe312ger)
  - breaking(gatsby-source-contentful): remove gatsby-image support [PR #33528](https://github.com/gatsbyjs/gatsby/pull/33528)
  - feat(gatsby-core-utils): Add retry on HTTP status codes to `fetchRemoteFile` [PR #33461](https://github.com/gatsbyjs/gatsby/pull/33461)
- [labifrancis](https://github.com/labifrancis): chore(gatsby-plugin-gatsby-google-analytics): Highlight the plugin we recommend [PR #33901](https://github.com/gatsbyjs/gatsby/pull/33901)
- [bytrangle](https://github.com/bytrangle): chore(docs): remove slug generation from MDX doc [PR #33915](https://github.com/gatsbyjs/gatsby/pull/33915)
- [Swarleys](https://github.com/Swarleys): feat(contentful): modifying schemes to add support for AVIF images [PR #33903](https://github.com/gatsbyjs/gatsby/pull/33903)
- [InfamousStarFox](https://github.com/InfamousStarFox): Fixes incorrect link "programmatically creating pages from data" [PR #33964](https://github.com/gatsbyjs/gatsby/pull/33964)
- [SaloniThete](https://github.com/SaloniThete): chore: Typo in BUG_REPORT [PR #33971](https://github.com/gatsbyjs/gatsby/pull/33971)
- [henryjw](https://github.com/henryjw): chore(docs): Update client-only doc [PR #33967](https://github.com/gatsbyjs/gatsby/pull/33967)
