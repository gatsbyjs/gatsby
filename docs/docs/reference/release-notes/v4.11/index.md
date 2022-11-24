---
date: "2022-03-29"
version: "4.11.0"
title: "v4.11 Release Notes"
---

Welcome to `gatsby@4.11.0` release (March 2022 #3)

Key highlights of this release:

- [`gatsby-source-shopify` v7](#gatsby-source-shopify-v7)
- [React 18](#react-18)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v4.10)

[Full changelog][full-changelog]

---

## `gatsby-source-shopify` v7

We released a new major version of `gatsby-source-shopify` 🎉 Thanks to the work of our community member [Byron Hill](https://github.com/byronlanehill) the new version features a bunch of improvements:

- You can now query product videos or 3D models, in addition to product images.
- Variants, Images, etc. now keep the order in which you define them in the Shopify backend.
- Multiple metafield types were merged to one single metafield type (more alignment with Shopify's admin API schema).
- You can now query presentment prices.
- Explicit type definitions with disabled type inference. Or in other words: You can have no products in your store or a bunch of fields that are `null` without breaking your schema or builds.
- The API schema nearly matches the Shopify admin API schema which means that for the most part you can refer to Shopify's documentation.

Check out the [V6 to V7 Migration Guide](/plugins/gatsby-source-shopify/#v6-to-V7-migration-guide) to learn more. Interested in contributing to Gatsby? Our [contributing section](/contributing/#how-to-contribute) has all the information you need.

## React 18

The latest RC of React 18 introduced a breaking change in the SSR API. In this release we're at 100% compatibility again. Right on time for the official React 18 release. Make sure to read [How to Try React 18 in Gatsby](https://www.gatsbyjs.com/blog/how-to-try-react-18-in-gatsby) to get started.

With React 18, you can start using Suspense, React.lazy and get your hands on the new concurrent mode to speed up your Gatsby website. More information can be found on [the React blog](https://reactjs.org/blog/2022/03/29/react-v18.html)

## Notable bugfixes & improvements

- `gatsby`
  - Fix eperm issue on windows when clearing cache, via [PR #35154](https://github.com/gatsbyjs/gatsby/pull/35154)
  - Improve functions compilation error, via [PR #35196](https://github.com/gatsbyjs/gatsby/pull/35196)
- `gatsby-plugin-utils`: Support aspect ratio for Image Service, via [PR #35087](https://github.com/gatsbyjs/gatsby/pull/35087)
- `gatsby-source-mongodb`: Add optional `typePrefix` option to override dbName, via [PR #33820](https://github.com/gatsbyjs/gatsby/pull/33820)
- `gatsby-cli`: Resolve babel preset ts explicitly, via [PR #35153](https://github.com/gatsbyjs/gatsby/pull/35153)
- `gatsby-plugin-preact`: Fix preact alias via [PR #35196](https://github.com/gatsbyjs/gatsby/pull/35156)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [seanparmelee](https://github.com/seanparmelee): feat(gatsby-source-graphql): upgrade apollo & graphql-tools deps [PR #34772](https://github.com/gatsbyjs/gatsby/pull/34772)
- [seanho96](https://github.com/seanho96): chore(docs): Update prismic source graphql tutorial docs [PR #35218](https://github.com/gatsbyjs/gatsby/pull/35218)
- [CommanderRoot](https://github.com/CommanderRoot): refactor: replace deprecated String.prototype.substr() [PR #35205](https://github.com/gatsbyjs/gatsby/pull/35205)
- [benackles](https://github.com/benackles): chore(docs): Add Deferred Static Generation to glossary [PR #35172](https://github.com/gatsbyjs/gatsby/pull/35172)
- [EdPike365](https://github.com/EdPike365): chore(docs): Add context to useScrollRestoration usage [PR #35163](https://github.com/gatsbyjs/gatsby/pull/35163)
- [byronlanehill](https://github.com/byronlanehill): BREAKING CHANGE(gatsby-source-shopify): Rewrite for media, presentment, schema, etc. [PR #34049](https://github.com/gatsbyjs/gatsby/pull/34049)
- [Aviatorscode2](https://github.com/Aviatorscode2): chore(docs): Move `loadable-components` instructions [PR #35116](https://github.com/gatsbyjs/gatsby/pull/35116)
- [michael-proulx](https://github.com/michael-proulx): feat(gatsby-source-mongodb): Add option name to overwrite node middle… [PR #33820](https://github.com/gatsbyjs/gatsby/pull/33820)
- [urre](https://github.com/urre): Update broken link [PR #35184](https://github.com/gatsbyjs/gatsby/pull/35184)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@4.11.0-next.0...gatsby@4.11.0
