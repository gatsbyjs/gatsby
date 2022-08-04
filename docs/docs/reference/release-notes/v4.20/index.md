---
date: "2022-08-02"
version: "4.20.0"
title: "v4.20 Release Notes"
---

Welcome to `gatsby@4.20.0` release (August 2022 #1)

Key highlights of this release:

- [RFC for changes in `sort` and aggregation fields in Gatsby GraphQL Schema](#rfc-for-changes-in-sort-and-aggregation-fields-in-gatsby-graphql-schema)
- [Release Candidate for gatsby-plugin-mdx v4](#release-candidate-for-gatsby-plugin-mdx-v4) - Support for MDX v2 and more!

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.19)

[Full changelog][full-changelog]

---

## RFC for changes in `sort` and aggregation fields in Gatsby GraphQL Schema

We are proposing Breaking Changes for the next major version of Gatsby to our GraphQL API. The goal of this change is increasing performance and reducing resource usage of builds. Proposed changes impact `sort` and aggregation fields (`group`, `min`, `max`, `sum`, `distinct`).

Basic example of proposed change:

Current:

```graphql
{
  allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
    nodes {
      ...fields
    }
  }
}
```

Proposed:

```jsx
{
  allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
    nodes {
      ...fields
    }
  }
}
```

To read more, head over to [RFC: Change to sort and aggregation fields API](https://github.com/gatsbyjs/gatsby/discussions/36242). We appreciate any feedback there.

## Release Candidate for `gatsby-plugin-mdx` v4

In case you missed it: We're working on a new major version of `gatsby-plugin-mdx` to support MDX v2, improve build & frontend performance, and simplify the API.

You can now try out a release candidate version, head to the [MDX v2 RFC](https://github.com/gatsbyjs/gatsby/discussions/25068) to learn more.

## Notable bugfixes & improvements

- `gatsby`
  - Preserve relative order of `<head>` meta tags, via [PR #36158](https://github.com/gatsbyjs/gatsby/pull/36158)
  - Fixed `--host` and `--https` options for `gatsby develop`, via [PR #36186](https://github.com/gatsbyjs/gatsby/pull/36186) and [PR #36248](https://github.com/gatsbyjs/gatsby/pull/36248)
  - Improved ContentSync mapping to also check Static Queries and type connections, via [PR #36132](https://github.com/gatsbyjs/gatsby/pull/36132)
  - Allow `export { default }` syntax to export page template, via [PR #29553](https://github.com/gatsbyjs/gatsby/pull/29553)
  - Fixed `pathPrefix` handling for DSG/SSR in `gatsby serve`, via [PR #36231](https://github.com/gatsbyjs/gatsby/pull/36231)
  - Improved performance of sorting, filtering and aggregation on fields with custom resolvers, via [PR #36253](https://github.com/gatsbyjs/gatsby/pull/36253)
- `gatsby-plugin-sass`
  - Added support for `additionalData` option, via [PR #36086](https://github.com/gatsbyjs/gatsby/pull/36086)
- `gatsby-plugin-sharp`
  - Ensure min 1px height for `BLURRED` placeholder, via [PR #35914](https://github.com/gatsbyjs/gatsby/pull/35914)
- `gatsby-plugin-utils`
  - fixed `IMAGE_CDN` and `FILE_CDN` handling for urls requiring encoding, via [PR #36179](https://github.com/gatsbyjs/gatsby/pull/36179)
- `gatsby-source-wordpress`
  - Added option to disable automatic use of `gatsby-plugin-catch-link` through setting `catchLinks: false` in `gatsby-source-wordpress` plugin options, via [PR #36141](https://github.com/gatsbyjs/gatsby/pull/36141)
- `gatsby-source-drupal`
  - Added support for translated content in Content Sync, via [PR #35514](https://github.com/gatsbyjs/gatsby/pull/35514)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [bytrangle](https://github.com/bytrangle): chore(docs): Instruct to install v2 of `unist-util-visit` in remark tutorial [PR #36221](https://github.com/gatsbyjs/gatsby/pull/36221)
- [laneparton](https://github.com/laneparton): fix(gatsby-plugin-sass): Add support for additionalData option [PR #36086](https://github.com/gatsbyjs/gatsby/pull/36086)
- [edlucas](https://github.com/edlucas): chore(docs): Clarify note in "local font" how-to [PR #36224](https://github.com/gatsbyjs/gatsby/pull/36224)
- [Shubhdeep12](https://github.com/Shubhdeep12): chore(docs): Typo fix in debugging-html-builds [PR #36228](https://github.com/gatsbyjs/gatsby/pull/36228)
- [RajputUsman](https://github.com/RajputUsman): chore(docs): Update to Basic Hardware and Software Requirements [PR #36153](https://github.com/gatsbyjs/gatsby/pull/36153)
- [chrispecoraro](https://github.com/chrispecoraro): chore(docs): Typo in 4.19 release notes [PR #36176](https://github.com/gatsbyjs/gatsby/pull/36176)
- [tordans](https://github.com/tordans): chore(docs): Add section about `navigate(-1)` [PR #36184](https://github.com/gatsbyjs/gatsby/pull/36184)
- [yanneves](https://github.com/yanneves): fix(gatsby): Allow `export { default }` named exports in page templates [PR #29553](https://github.com/gatsbyjs/gatsby/pull/29553)
- [openscript](https://github.com/openscript): chore(docs): Add dependency for TypeScript testing [PR #36050](https://github.com/gatsbyjs/gatsby/pull/36050)
- [ThomasVandenhede](https://github.com/ThomasVandenhede): fix(gatsby-plugin-sharp): Ensure min 1px height for `BLURRED` placeholder [PR #35914](https://github.com/gatsbyjs/gatsby/pull/35914)
- [Hunta88](https://github.com/Hunta88): Grammar typo fixed [PR #36219](https://github.com/gatsbyjs/gatsby/pull/36219)
- [billybrown-iii](https://github.com/billybrown-iii): chore(docs): fix outdated link [PR #36145](https://github.com/gatsbyjs/gatsby/pull/36145)
- [dan-mba](https://github.com/dan-mba): chore(docs): Add `react-helmet` note in Gatsby Head reference [PR #36216](https://github.com/gatsbyjs/gatsby/pull/36216)
- [Auspicus](https://github.com/Auspicus): fix(gatsby-source-drupal): Add langcode to manifest ID [PR #35514](https://github.com/gatsbyjs/gatsby/pull/35514)
- [merceyz](https://github.com/merceyz): fix: add missing dependencies [PR #36230](https://github.com/gatsbyjs/gatsby/pull/36230)
- [axe312ger](https://github.com/axe312ger): chore(gatsby-source-contentful): migrate to latest Contentful SDK [PR #35501](https://github.com/gatsbyjs/gatsby/pull/35501)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.20.0-next.0...gatsby@4.20.0
