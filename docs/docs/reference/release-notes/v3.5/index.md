---
date: "2021-05-11"
version: "3.5.0"
---

# [v3.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.5.0-next.0...gatsby@3.5.0) (May 2021 #1)

Welcome to `gatsby@3.5.0` release (May 2021 #1)

Key highlights of this release:

- [Documentation updates](#) - new docs on troubleshooting build performance
- [Performance improvements](#) - faster query running
- [Experimental: Gatsby Functions](#experimental-gatsby-functions) - serverless functions in Gatsby & Gatsby Cloud
- [New gatsby-source-shopify](#) - TODO
- [gatsby-graphql-source-toolkit 2.0](#) - TODO

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.4)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.5.0-next.0...gatsby@3.5.0)

---

## Docs updates

- [PR](https://github.com/gatsbyjs/gatsby/pull/31138)
  New top-level CSS doc: https://www.gatsbyjs.com/docs/how-to/styling/built-in-css/
- [PR](https://github.com/gatsbyjs/gatsby/pull/31137)
  Javascript tooling: https://www.gatsbyjs.com/docs/how-to/local-development/javascript-tooling/
- [PR](https://github.com/gatsbyjs/gatsby/pull/31137)
  Creating Pages: https://www.gatsbyjs.com/docs/how-to/routing/creating-routes/
- [PR](https://github.com/gatsbyjs/gatsby/pull/31140)
  Updated 'Adding Markdown Pages' to use Collection Routes: https://www.gatsbyjs.com/docs/how-to/routing/adding-markdown-pages/
- [PR](https://github.com/gatsbyjs/gatsby/pull/31096)
  Architecture of Gatsby's image plugins: https://www.gatsbyjs.com/docs/conceptual/image-plugin-architecture/

## Performance improvements

Speedup CLI startup: https://github.com/gatsbyjs/gatsby/pull/31134

Create page object & SitePage node in same action creator: https://github.com/gatsbyjs/gatsby/pull/31104

Faster queries (esp. with `eq` filters): https://github.com/gatsbyjs/gatsby/pull/31269

## Notable bugfixes & improvements

- Fix support of theme shadowing in monorepo [PR #30435](https://github.com/gatsbyjs/gatsby/pull/30435)
- Fix scroll restoration for layout components [PR #26861](https://github.com/gatsbyjs/gatsby/pull/26861)
- `gatsby-plugin-preact`: enable error-overlay [PR #30613](https://github.com/gatsbyjs/gatsby/pull/30613)
- `gatsby-plugin-sitemap`: allow writing sitemap to the root of the public folder [PR #31130](https://github.com/gatsbyjs/gatsby/pull/31130)
- `gatsby-transformer-remark`: restore support for footnotes [PR #31019](https://github.com/gatsbyjs/gatsby/pull/31019)

## Contributors

TODO
