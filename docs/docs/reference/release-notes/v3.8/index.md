---
date: "2021-06-22"
version: "3.8.0"
title: "v3.8 Release Notes"
---

Welcome to `gatsby@3.8.0` release (June 2021 #2)

Key highlights of this release:

- [React 18 - Alpha](#react-18---alpha) - React 18 Alpha is available in Gatsby
- [`gatsby-source-shopify` v5](#gatsby-source-shopify-v5) - TODO
- [Web Vitals Tracking](#web-vitals-tracking) - Analytics Plugins now support tracking Web Vitals
- [webpack caching](#webpack-caching) - built-in persistent caching activated for everyone

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.7)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.8.0-next.0...gatsby@3.8.0)

---

## React 18 - Alpha

Gatsby supports [React 18 Alpha](https://reactjs.org/blog/2021/06/08/the-plan-for-react-18.html). It's still very early days but we like to be ahead of the pack. You can use `startTransition` and `stateBatching` today by installing `react@alpha` & `react-dom@alpha`. We love to get feedback in the [Umbrella Discussion](https://github.com/gatsbyjs/gatsby/discussions/31943).

## `gatsby-source-shopify` v5

TODO

## Web Vitals Tracking

By using the [`web-vitals`](https://github.com/GoogleChrome/web-vitals) package we've added support for tracking Web Vitals to `gatsby-plugin-google-analytics` & `gatsby-plugin-google-tagmanager` ([PR #31665](https://github.com/gatsbyjs/gatsby/pull/31665)).

They send three metrics:

- **Largest Contentful Paint (LCP)**: measures loading performance. To provide a good user experience, LCP should occur within 2.5 seconds of when the page first starts loading.
- **First Input Delay (FID)**: measures interactivity. To provide a good user experience, pages should have a FID of 100 milliseconds or less.
- **Cumulative Layout Shift (CLS)**: measures visual stability. To provide a good user experience, pages should maintain a CLS of 1 or less.

You can activate the tracking by setting `enableWebVitalsTracking` to `true`.

## webpack caching

In the [previous 3.7 release](/docs/reference/release-notes/v3.7) we started a gradual rollout of webpack 5 built-in persistent caching. It allows webpack to reuse results of previous compilations and significantly speed up compilation steps. With Gatsby v3.8 it's now enabled for everyone.

## Notable bugfixes & improvements

- `gatsby-plugin-sitemap`: Properly throw error on missing siteUrl via [PR #31963](https://github.com/gatsbyjs/gatsby/pull/31963)
- `gatsby`: Removed outdated ESLint rules `jsx-a11y/no-onchange` and `jsx-a11y/accessible-emoji` via [PR #31896](https://github.com/gatsbyjs/gatsby/pull/31896)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.8.0-next.0...gatsby@3.8.0) to this release 💜

TODO
