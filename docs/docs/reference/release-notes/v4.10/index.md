---
date: "2022-03-15"
version: "4.10.0"
title: "v4.10 Release Notes"
---

Welcome to `gatsby@4.10.0` release (March 2022 #2)

Key highlights of this release:

- [Image CDN](#image-cdn)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.9)

[Full changelog][full-changelog]

---

## Image CDN

Free your site from slow images forever. With the new Image CDN, we've added better support for remote files and images when building source plugins. Currenlty, WordPress & Contentful are using the new `RemoteFile` GraphQL interface to enable the new `GatsbyImage` resolver. The new resolver downloads images on demand and processes them during the build. Reducing build times and optimizing the user experience. What if we could remove image processing as a whole during the build step? Today with Image CDN on Gatsby Cloud, we defer all image processing at the edge, getting even faster builds!

Checkout our [Enabling Image CDN support Guide](https://www.gatsbyjs.com/docs/how-to/plugins-and-themes/creating-a-source-plugin/#enabling-image-cdn-support) and [Blog Post](https://www.gatsbyjs.com/blog/image-cdn-lightning-fast-image-processing-for-gatsby-cloud)

## Notable bugfixes & improvements

- `gatsby`
  - Fix handling of encoded query params, via [PR #34816](https://github.com/gatsbyjs/gatsby/pull/34816)
  - Fix incorrect "inconsistent node counters" errors, via [PR #35025](https://github.com/gatsbyjs/gatsby/pull/35025)
  - Use `gatsby-config.ts` file when creating new Gatsby project with TypeScript, via [PR #35128](https://github.com/gatsbyjs/gatsby/pull/35128)
  - Don't write out page-data file if query rerun but result didn't change, via [PR #34925](https://github.com/gatsbyjs/gatsby/pull/34925)
- `gatsby-plugin-sharp`
  - Fix MaxListenersExceededWarning messages, via [PR #35009](https://github.com/gatsbyjs/gatsby/pull/35009)
  - Fix generating multiple similar images with different `duotone` settings, via [PR #35075](https://github.com/gatsbyjs/gatsby/pull/35075)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

todo

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.10.0-next.0...gatsby@4.10.0
