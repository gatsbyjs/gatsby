---
date: "2021-06-22"
version: "3.8.0"
title: "v3.8 Release Notes"
---

Welcome to `gatsby@3.8.0` release (June 2021 #2)

Key highlights of this release:

- [React 18 - Alpha](#react-18---alpha) - React 18 Alpha is available in Gatsby
- [`gatsby-source-shopify` v5](#gatsby-source-shopify-v5) - brand new version
- [Web Vitals Tracking](#web-vitals-tracking) - Analytics Plugins now support tracking Web Vitals
- [webpack caching](#webpack-caching) - built-in persistent caching activated for everyone
- [Improvements to Drupal integration](#drupal-integration) — Sourcing is up to 30%+ faster and much more reliable

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.7)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.8.0-next.0...gatsby@3.8.0)

---

## React 18 - Alpha

Gatsby supports [React 18 Alpha](https://reactjs.org/blog/2021/06/08/the-plan-for-react-18.html). It's still very early days but we like to be ahead of the pack. You can use `startTransition` and `stateBatching` today by installing `react@alpha` & `react-dom@alpha`. We love to get feedback in the [Umbrella Discussion](https://github.com/gatsbyjs/gatsby/discussions/31943).

## `gatsby-source-shopify` v5

Gatsby's new Shopify integration which [we announced at GatsbyConf](https://www.youtube.com/watch?v=43fJTO9gMUE) earlier this year is now generally available.

- Incremental data updates are now 16x faster than previous versions
- v5 uses Shopify's Admin API and bulk operation to overcome API rate limits of the Storefront API
- Gatsby Cloud now offers Quick Connect for Shopify

[Read more](https://www.gatsbyjs.com/solutions/shopify/)

## Web Vitals Tracking

We've added support for tracking Web Vitals to `gatsby-plugin-google-analytics` & `gatsby-plugin-google-tagmanager` by using the [`web-vitals`](https://github.com/GoogleChrome/web-vitals) package ([PR #31665](https://github.com/gatsbyjs/gatsby/pull/31665)).

The plugins now send three metrics:

- **Largest Contentful Paint (LCP)**: measures loading performance. To provide a good user experience, LCP should occur within 2.5 seconds of when the page first starts loading.
- **First Input Delay (FID)**: measures interactivity. To provide a good user experience, pages should have a FID of 100 milliseconds or less.
- **Cumulative Layout Shift (CLS)**: measures visual stability. To provide a good user experience, pages should maintain a CLS of 1 or less.

You can activate the tracking in your `gatsby-config.js` by setting `enableWebVitalsTracking` to `true`.

## webpack caching

In the [previous 3.7 release](/docs/reference/release-notes/v3.7) we started a gradual rollout of webpack 5 built-in persistent caching. It allows webpack to reuse results of previous compilations and significantly speed up compilation steps. With Gatsby v3.8 it's now enabled for everyone.

## Drupal integration

[gatsby-source-drupal](https://www.gatsbyjs.com/plugins/gatsby-source-drupal/?=drupal) is now a lot faster and more reliable when sourcing data from Drupal. We switched to use [Got](https://github.com/sindresorhus/got) for HTTP requests plus added an optimized http agent and http/2 support.

- [#31514](https://github.com/gatsbyjs/gatsby/pull/31514)
- [#32012](https://github.com/gatsbyjs/gatsby/pull/32012)

## Notable bugfixes & improvements

- `gatsby-plugin-sitemap`: Properly throw error on missing siteUrl via [PR #31963](https://github.com/gatsbyjs/gatsby/pull/31963)
- `gatsby`: Removed outdated ESLint rules `jsx-a11y/no-onchange` and `jsx-a11y/accessible-emoji` via [PR #31896](https://github.com/gatsbyjs/gatsby/pull/31896)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.8.0-next.0...gatsby@3.8.0) to this release 💜

- [prajapati-parth](https://github.com/prajapati-parth): docs(gatsby-plugin-image): fix minor typo [PR #31751](https://github.com/gatsbyjs/gatsby/pull/31751)
- [cometkim](https://github.com/cometkim): fix(gatsby): fix signature for latest experimental version of react-dom [PR #31750](https://github.com/gatsbyjs/gatsby/pull/31750)
- [lqze](https://github.com/lqze): chore(docs): Update gatsby-plugin-image typos [PR #31790](https://github.com/gatsbyjs/gatsby/pull/31790)
- [dhrumilp15](https://github.com/dhrumilp15): chore(docs): Update digitalocean certbot instructions [PR #31796](https://github.com/gatsbyjs/gatsby/pull/31796)
- [DanailMinchev](https://github.com/DanailMinchev): chore(docs): Add `testEnvironment` to RTL doc [PR #31793](https://github.com/gatsbyjs/gatsby/pull/31793)
- [gmanfunky](https://github.com/gmanfunky): chore(docs): Add link to latest migration doc [PR #31798](https://github.com/gatsbyjs/gatsby/pull/31798)
- [lee1409](https://github.com/lee1409): fix(gatsby-remark-copy-linked-files): replace checking parent node type to 'dir' [PR #31780](https://github.com/gatsbyjs/gatsby/pull/31780)
- [smurrayatwork](https://github.com/smurrayatwork): Fixes bug where datum have no attributes and attributes have no langcode. [PR #31864](https://github.com/gatsbyjs/gatsby/pull/31864)
- [ThyNameIsMud](https://github.com/ThyNameIsMud): fix(gatsby-source-wordpress) Use send property for timeout (#31737) [PR #31847](https://github.com/gatsbyjs/gatsby/pull/31847)
- [eligundry](https://github.com/eligundry): fix(gatsby-source-contentful): improve error message when dominant color can't be generated [PR #31879](https://github.com/gatsbyjs/gatsby/pull/31879)
- [NikSchaefer](https://github.com/NikSchaefer): chore(docs): Fix grammar issue [PR #31937](https://github.com/gatsbyjs/gatsby/pull/31937)
- [amaaniqbal](https://github.com/amaaniqbal): chore(docs): Fix multiple grammar issues [PR #31946](https://github.com/gatsbyjs/gatsby/pull/31946)
- [nikolaik](https://github.com/nikolaik): docs: Fix missing commas in plugin-image defaults [PR #31961](https://github.com/gatsbyjs/gatsby/pull/31961)
