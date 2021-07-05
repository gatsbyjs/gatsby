---
date: "2021-07-06"
version: "3.9.0"
title: "v3.9 Release Notes"
---

Welcome to `gatsby@3.9.0` release (July 2021 #1)

Key highlights of this release:

- [Suspense support at build time](#suspense-support-at-build-time) - Enables SSR support for Suspense when using React 18 (Alpha)
- [title 2](#example-2) - one-liner description

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.8)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.9.0-next.0...gatsby@3.9.0)

---

## Suspense support at build time

We're happy to announce support for the new React 18 server architecture during built time. When installing `react@alpha` and `react-dom@alpha`, you automatically opt into the new [`pipeToNodeWritable`](https://github.com/reactwg/react-18/discussions/37) renderer. Now you're able to use `Suspense` and `React.lazy` on the server as well.

## Notable bugfixes & improvements

- `gatsby`: Bumped `express-graphql` to `0.12.0` to only have graphql v15 installed via [PR #31178](https://github.com/gatsbyjs/gatsby/pull/31178)
- `gatsby`: Prevent generation of polyfill bundle if not needed via [PR #31993](https://github.com/gatsbyjs/gatsby/pull/31993)
- `gatsby-plugin-netlify-cms`: Limit global styles to preview pane only via [PR #32106](https://github.com/gatsbyjs/gatsby/pull/32106)
- `gatsby`: Add activity for writing out `page-data.json` files via [PR #31987](https://github.com/gatsbyjs/gatsby/pull/31987)

## Contributors

TODO
