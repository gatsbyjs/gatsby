---
date: "2021-07-06"
version: "3.9.0"
title: "v3.9 Release Notes"
---

Welcome to `gatsby@3.9.0` release (July 2021 #1)

Key highlights of this release:

- [React 18 - New Suspense SSR Architecture](#react-18---new-suspense-ssr-architecture) - Enables SSR support for Suspense when using React 18 (Alpha)
- [Shopify App for Gatsby Cloud](#shopify-app-for-gatsby-cloud)
- [gatsby-source-contentful](#quality-of-life-improvements-to-gatsby-source-contentful) - quality of life improvements

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.8)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.9.0-next.0...gatsby@3.9.0)

---

## React 18 - New Suspense SSR Architecture

We're happy to announce support for the new React 18 server architecture during build time.
When installing `react@alpha` and `react-dom@alpha`, you automatically opt into the new
[`pipeToNodeWritable`](https://github.com/reactwg/react-18/discussions/37) renderer.
Now you're able to use `Suspense` and `React.lazy` on the server as well.

## Shopify app for Gatsby Cloud

Following the brand-new Shopify source plugin published in the [previous release](/docs/reference/release-notes/v3.8/#gatsby-source-shopify-v5),
this release brings Gatsby Cloud to Shopify App Store.

Install Gatsby Cloud from the app store to quickly connect your Shopify store. Choose an existing project you’ve
been working on or get up and running the Shopify starter in seconds.

[Read more in our blog](https://www.gatsbyjs.com/blog/build-your-next-storefront-with-gatsby-cloud).

## Quality of life improvements to `gatsby-source-contentful`

- Don't ignore errors thrown when fetching assets via [PR #24288](https://github.com/gatsbyjs/gatsby/pull/24288)
- Re-enable support for gif images via [PR #31986](https://github.com/gatsbyjs/gatsby/pull/31986)
- Force base64 previews to be formatted as JPEG via [PR #32155](https://github.com/gatsbyjs/gatsby/pull/32155)

## Notable bugfixes & improvements

- `gatsby`: Bumped `express-graphql` to `0.12.0` to only have graphql v15 installed via [PR #31178](https://github.com/gatsbyjs/gatsby/pull/31178)
- `gatsby`: Prevent generation of polyfill bundle if not needed via [PR #31993](https://github.com/gatsbyjs/gatsby/pull/31993)
- `gatsby-plugin-netlify-cms`: Limit global styles to preview pane only via [PR #32106](https://github.com/gatsbyjs/gatsby/pull/32106)
- `gatsby`: Add activity for writing out `page-data.json` files via [PR #31987](https://github.com/gatsbyjs/gatsby/pull/31987)
- `gatsby`: Fixed a bug in develop when a new page is not available with HMR via [PR #32189](https://github.com/gatsbyjs/gatsby/pull/32189)
- `gatsby`: Fixed a bug with filtering by custom interface fields (affecting WordPress plugin) via [PR #32195](https://github.com/gatsbyjs/gatsby/pull/32195)
- `gatsby`: Performance improvements to queries with `limit`/`skip` via [PR #32135](https://github.com/gatsbyjs/gatsby/pull/32135)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.9.0-next.0...gatsby@3.9.0) to this release 💜

- [MichaelDeBoey](https://github.com/MichaelDeBoey): chore: Delete profile.js [PR #31997](https://github.com/gatsbyjs/gatsby/pull/31997)
- [shanekenney](https://github.com/shanekenney): fix(gatsby-source-contentful): Don't ignore errors thrown when fetching assets [PR #24288](https://github.com/gatsbyjs/gatsby/pull/24288)
- [axe312ger](https://github.com/axe312ger)

  - fix(contentful): reenable support for gif images [PR #31986](https://github.com/gatsbyjs/gatsby/pull/31986)
  - fix(gatsby-source-contentful): force base64 previews to be formatted as JPEG [PR #32155](https://github.com/gatsbyjs/gatsby/pull/32155)

- [evank21](https://github.com/evank21): chore(docs): Fix typo in tutorial [PR #32050](https://github.com/gatsbyjs/gatsby/pull/32050)
- [kdichev](https://github.com/kdichev): chore(gatsby-plugin-image): Add duotone, grayscale, rotate and trim options in transformOptions TS type [PR #31926](https://github.com/gatsbyjs/gatsby/pull/31926)
- [stanulilic](https://github.com/stanulilic): docs: Fix typos in tutorial 4 [PR #31891](https://github.com/gatsbyjs/gatsby/pull/31891)
- [alvis](https://github.com/alvis): fix(gatsby): correct args type in createParentChildLink [PR #32139](https://github.com/gatsbyjs/gatsby/pull/32139)
- [justinyaodu](https://github.com/justinyaodu): chore(gatsby-plugin-mdx): Add comment why rehype-slug is required [PR #32128](https://github.com/gatsbyjs/gatsby/pull/32128)
- [browniebroke](https://github.com/browniebroke): fix(gatsby): leave `xmlns` element when optimizing SVGs [PR #32123](https://github.com/gatsbyjs/gatsby/pull/32123)
- [erezrokah](https://github.com/erezrokah): fix(plugin-netlify-cms): exclude cms.css from index.html [PR #32106](https://github.com/gatsbyjs/gatsby/pull/32106)
- [herecydev](https://github.com/herecydev): feat(gatsby): Prevent generation of polyfill bundle if not needed [PR #31993](https://github.com/gatsbyjs/gatsby/pull/31993)
- [alisson-suzigan](https://github.com/alisson-suzigan): chore(gatsby): Migrate schema-composer.js to TS [PR #31998](https://github.com/gatsbyjs/gatsby/pull/31998)
- [gijsbotje](https://github.com/gijsbotje): chore(docs): Fix environment variables example [PR #32169](https://github.com/gatsbyjs/gatsby/pull/32169)
- [AntoineGRoy](https://github.com/AntoineGRoy): chore(starters): Add a Gatsby CLI instructions link [PR #32158](https://github.com/gatsbyjs/gatsby/pull/32158)
- [Pearce-Ropion](https://github.com/Pearce-Ropion): chore(netlify-cms): Bump webpack version to match gatsby [PR #32175](https://github.com/gatsbyjs/gatsby/pull/32175)
- [jamesaucode](https://github.com/jamesaucode): chore(gatsby): Bumped express-graphql to v0.12.0 [PR #31178](https://github.com/gatsbyjs/gatsby/pull/31178)
