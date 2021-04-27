---
date: "2021-04-27"
version: "3.4.0"
---

# [v3.4](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.4.0-next.0...gatsby@3.4.0) (April 2021 #2)

Welcome to `gatsby@3.4.0` release (April 2021 #2)

Key highlights of this release:

- [Experimental: Enable webpack persistent caching for production builds](#experimental-enable-webpack-persistent-caching-for-production-builds) - significantly speed up webpack compilation on subsequent builds
- [Experimental: Gatsby Functions](#experimental-gatsby-functions) - serverless functions in Gatsby & Gatsby Cloud
- [New Aggregation Resolvers](#new-aggregation-resolvers) - adds `min()`, `max()`, and `sum()` resolvers to `allX` queries
- [Better Fast Refresh handling for styling libraries](#better-fast-refresh-handling-for-styling-libraries) - Theme UI and Chakra UI now work correctly with Fast Refresh

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.3)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.4.0-next.0...gatsby@3.4.0)

---

## Experimental: Enable webpack persistent caching for production builds

[webpack 5 introduced built in persistent caching](https://webpack.js.org/blog/2020-10-10-webpack-5-release/#persistent-caching). It allows webpack to reuse result of previous compilations and significantly speed up compilation steps.

To use it, add a flag to your `gatsby-config.js`:

```js
// In your gatsby-config.js
module.exports = {
  // your existing config
  flags: {
    PRESERVE_WEBPACK_CACHE: true,
  },
}
```

[Details and discussion](https://github.com/gatsbyjs/gatsby/discussions/28331).

## Experimental: Functions

We're making our initial alpha release of serverless functions in Gatsby!

- [Details and discussion](https://github.com/gatsbyjs/gatsby/discussions/30735)
- [Original PR](https://github.com/gatsbyjs/gatsby/pull/30192).
- [Sign up for early access to Functions in Gatsby Cloud](https://www.gatsbyjs.com/functions/).

## New Aggregation Resolvers

The [PR #30789](https://github.com/gatsbyjs/gatsby/pull/30789) added new aggregation resolvers similar to the already existing `group` and `distinct` resolvers. You now can use `min()`, `max()`, and `sum()`. They support numeric fields, but also attempt to cast non-numeric fields and includes them if the value is not `NaN`.

An example query:

```graphql
{
  allShopifyProduct {
    maxPrice: max(field: variants___price)
    minPrice: min(field: variants___price)
    totalPrice: sum(field: variants___price)
  }
}
```

## Better Fast Refresh handling for styling libraries

Since the introduction of Fast Refresh changes to theme files both in [Theme UI](https://theme-ui.com/) and [Chakra UI](https://chakra-ui.com/) didn't result in correct hot-reloading behavior as the user had to manually reload the page to see their changes. The [PR #30901](https://github.com/gatsbyjs/gatsby/pull/30901) added better Fast Refresh handling for components that don't satisfy the constraints set by Fast Refresh but it didn't completely fix the incorrect behavior in both plugins. Upstream PRs from us to [Theme UI](https://github.com/system-ui/theme-ui/pull/1659) and [Chakra UI](https://github.com/chakra-ui/chakra-ui/pull/3841) fixed the behavior! Install `theme-ui@^0.7.1` or `@chakra-ui/gatsby-plugin@^2.0.0` to get the updates.

## Notable bugfixes & improvements

- Fixed page context changes not triggering query rerunning [PR #28590](https://github.com/gatsbyjs/gatsby/pull/28590)
- Fixed not being able to disable `DEV_SSR` flag when `FAST_DEV` is enabled [PR #30992](https://github.com/gatsbyjs/gatsby/pull/30992)
- Speed up `createPages` by ~10% by memoizing `process.env` access [PR #30768](https://github.com/gatsbyjs/gatsby/pull/30768)
- You now can define the `--host` option of `gatsby-cli` with `env.HOST` [PR #26712](https://github.com/gatsbyjs/gatsby/pull/26712)
- Allow CI AWS lamba builds [PR #30653](https://github.com/gatsbyjs/gatsby/pull/30653)
- File System Route API: De-dupe collection pages [PR #31016](https://github.com/gatsbyjs/gatsby/pull/31016)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.4.0-next.0...gatsby@3.4.0) to this release 💜

- [gustavo-a](https://github.com/gustavo-a): fix(gatsby-source-wordpress): change `console.warning` to `console.warn` [PR #30764](https://github.com/gatsbyjs/gatsby/pull/30764)
- [NatnaelSisay](https://github.com/NatnaelSisay): Fix: change attribute name [PR #30800](https://github.com/gatsbyjs/gatsby/pull/30800)
- [evildmp](https://github.com/evildmp): chore(docs): Update links to Diátaxis framework [PR #30808](https://github.com/gatsbyjs/gatsby/pull/30808)
- [hoobdeebla](https://github.com/hoobdeebla): fix(renovate): add breaking minor updates to major updates list [PR #30676](https://github.com/gatsbyjs/gatsby/pull/30676)
- [Js-Brecht](https://github.com/Js-Brecht)

  - fix(gatsby-core-utils): fetch-remote-file download failure when missing content-length header [PR #30810](https://github.com/gatsbyjs/gatsby/pull/30810)
  - handle plugin parentDir resolution in resolvePlugin() [PR #30812](https://github.com/gatsbyjs/gatsby/pull/30812)
  - fix(gatsby): "Cannot find module 'babel-preset-gatsby'" error [PR #30813](https://github.com/gatsbyjs/gatsby/pull/30813)

- [herecydev](https://github.com/herecydev): fix(gatsby): Decode base path in runtime [PR #30682](https://github.com/gatsbyjs/gatsby/pull/30682)
- [axe312ger](https://github.com/axe312ger)

  - Refactor: using-contentful to use gatsby-plugin-image exclusively [PR #30717](https://github.com/gatsbyjs/gatsby/pull/30717)
  - feat(contentful): warn users when using restricted content type names [PR #30715](https://github.com/gatsbyjs/gatsby/pull/30715)
  - test: introduce e2e tests for Contentful [PR #30390](https://github.com/gatsbyjs/gatsby/pull/30390)
  - test: Add Contentful content rendering to E2E tests [PR #30854](https://github.com/gatsbyjs/gatsby/pull/30854)
  - test(contentful): improve content reference snapshot tests [PR #31008](https://github.com/gatsbyjs/gatsby/pull/31008)

- [kaboumk](https://github.com/kaboumk): fix(gatsby-starter-wordpress-blog): Fix altText [PR #30832](https://github.com/gatsbyjs/gatsby/pull/30832)
- [johndavidcooley](https://github.com/johndavidcooley): chore(docs): Fix typo [PR #30858](https://github.com/gatsbyjs/gatsby/pull/30858)
- [AbdallahAbis](https://github.com/AbdallahAbis): chore(gatsby-plugin-image): Remove version note [PR #30758](https://github.com/gatsbyjs/gatsby/pull/30758)
- [pvorozhe](https://github.com/pvorozhe): chore: Add cloud hosting option for starter READMEs [PR #30792](https://github.com/gatsbyjs/gatsby/pull/30792)
- [pelleknaap](https://github.com/pelleknaap): Fix small typo [PR #30911](https://github.com/gatsbyjs/gatsby/pull/30911)
- [mgurevin](https://github.com/mgurevin): fix(gatsby-cli): added HOST environment variable [PR #26712](https://github.com/gatsbyjs/gatsby/pull/26712)
- [VMBindraban](https://github.com/VMBindraban): chore(gatsby-source-graphql): Update README url => uri [PR #30872](https://github.com/gatsbyjs/gatsby/pull/30872)
- [OdysLam](https://github.com/OdysLam): chore(docs): Add tailwind to more options at tutorial part 2 [PR #30910](https://github.com/gatsbyjs/gatsby/pull/30910)
- [moonmeister](https://github.com/moonmeister): breaking(gatsby-plugin-sitemap): vNext rewrite [PR #25670](https://github.com/gatsbyjs/gatsby/pull/25670)
- [AcademicHumber](https://github.com/AcademicHumber): Change the 'idKey' parameter's default value [PR #30502](https://github.com/gatsbyjs/gatsby/pull/30502)
- [kennethormandy](https://github.com/kennethormandy): chore(gatsby-plugin-mdx): Document CommonMark option [PR #30669](https://github.com/gatsbyjs/gatsby/pull/30669)
- [mathisobadia](https://github.com/mathisobadia): fix(gatsby): change order of feedbackDisabled checks to allow CI AWS lambda build [PR #30653](https://github.com/gatsbyjs/gatsby/pull/30653)
- [MichaelDeBoey](https://github.com/MichaelDeBoey): chore(gatsby-plugin-flow): Add pluginOptionsSchema validation [PR #27599](https://github.com/gatsbyjs/gatsby/pull/27599)
- [chrish-d](https://github.com/chrish-d): chore(docs): Updated warning icon to use emoji [PR #30979](https://github.com/gatsbyjs/gatsby/pull/30979)
- [jcalcaben](https://github.com/jcalcaben): fix(gatsby-plugin-mdx): Reference style links broken in static builds [PR #30967](https://github.com/gatsbyjs/gatsby/pull/30967)
