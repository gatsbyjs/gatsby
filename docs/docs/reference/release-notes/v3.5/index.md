---
date: "2021-05-11"
version: "3.5.0"
title: "v3.5 Release Notes"
---

Welcome to `gatsby@3.5.0` release (May 2021 #1)

Key highlights of this release:

- [Performance improvements](#performance-improvements) - up to 20% faster CLI startup, up to 20% faster query running, 70% speedup to creating pages
- [`gatsby-graphql-source-toolkit` v2](#gatsby-graphql-source-toolkit-v2) - Compatibility with Gatsby v3
- [New SSR in Develop overlay](#new-ssr-in-develop-overlay) - the experimental SSR in Develop feature got a new overlay
- [Documentation updates](#documentation-updates) - new docs: Functions, CSS, and our image plugins

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.4)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.5.0-next.0...gatsby@3.5.0)

---

## Performance Improvements

We're always working hard on making Gatsby faster. In this release we shipped three improvements:

- Speedup CLI startup by lazily requiring some modules. [PR #31134](https://github.com/gatsbyjs/gatsby/pull/31134)
- Create page object & `SitePage` node in same action creator. In our synthetic [create-pages](https://github.com/gatsbyjs/gatsby/tree/master/benchmarks/create-pages) benchmark (for 100K pages) this reduced the `createPages` activity from 16s to 4.5s (~70% drop) and peak RSS memory from 1.4gb to 0.7gb (~50% drop). [PR #31104](https://github.com/gatsbyjs/gatsby/pull/31104)
- Up to ~20% improvement to running queries by switching to a faster queue library ([fastq](https://www.npmjs.com/package/fastq)). The improvements are most noticeable if you use the fastest query filters (e.g. `eq` filter on the `id` property) and don't do CPU intensive work in query running e.g. process markdown or MDX. [PR #31269](https://github.com/gatsbyjs/gatsby/pull/31269)

## `gatsby-graphql-source-toolkit` v2

The [`gatsby-graphql-source-toolkit`](https://github.com/gatsbyjs/gatsby-graphql-toolkit) simplifies data sourcing from remote GraphQL APIs into Gatsby. While it's not a source plugin by itself, it helps you writing custom GraphQL source plugins by providing a set of convenience tools and conventions. [Craft CMS](https://github.com/craftcms/gatsby-source-craft) or [GraphCMS](https://github.com/GraphCMS/gatsby-source-graphcms) use it for their source plugins.

The bump to a new major version ensures compatibility with `gatsby@^3.0.0`. No breaking changes were in this release.

## New SSR in Develop overlay

Previously the error overlay (when the page didn't successfully SSR) consisted out of a HTML page served by express. But that wasn't tied into our already existing [Fast Refresh](/docs/reference/local-development/fast-refresh/) overlay we use throughout Gatsby. The information on the page stays the same but it now has the look & feel of all our other errors:

![A modal showing that the page failed to SSR and showing a code block with the exact location of the error. Optionally you can reload the page or skip SSR rendering for now.](https://user-images.githubusercontent.com/16143594/116409324-088a9e00-a834-11eb-8cf3-1c3745be8b51.png)

## Documentation Updates

- [New Functions docs](/docs/how-to/functions/) — [PR #31066](https://github.com/gatsbyjs/gatsby/pull/31066)
- [New top-level CSS doc](/docs/how-to/styling/built-in-css/) - [PR #31138](https://github.com/gatsbyjs/gatsby/pull/31138)
- [Architecture of Gatsby's image plugins](/docs/conceptual/image-plugin-architecture/) - [PR #31096](https://github.com/gatsbyjs/gatsby/pull/31096)
- If you're maintaining a plugin, please subscribe to [this GitHub discussion](https://github.com/gatsbyjs/gatsby/discussions/30955) to receive information about changes that may require updates to the plugins you maintain

## Notable bugfixes & improvements

- Fix support of theme shadowing in monorepo [PR #30435](https://github.com/gatsbyjs/gatsby/pull/30435)
- Fix scroll restoration for layout components [PR #26861](https://github.com/gatsbyjs/gatsby/pull/26861)
- `gatsby-plugin-mdx`: make HMR work again for MDX [PR #31288](https://github.com/gatsbyjs/gatsby/pull/31288)
- `gatsby-plugin-preact`: enable error-overlay [PR #30613](https://github.com/gatsbyjs/gatsby/pull/30613)
- `gatsby-plugin-sitemap`: allow writing sitemap to the root of the public folder [PR #31130](https://github.com/gatsbyjs/gatsby/pull/31130)
- `gatsby-transformer-remark`: restore support for footnotes [PR #31019](https://github.com/gatsbyjs/gatsby/pull/31019)
- Add `ImageDataLike` as an exported type of `gatsby-plugin-image` [PR #30590](https://github.com/gatsbyjs/gatsby/pull/30590)
- Update the public plugin API types [PR #30819](https://github.com/gatsbyjs/gatsby/pull/30819)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.5.0-next.0...gatsby@3.5.0) to this release 💜

- [micha149](https://github.com/micha149): fix(gatsby-react-router-scroll): scroll restoration for layout components [PR #26861](https://github.com/gatsbyjs/gatsby/pull/26861)
- [hoobdeebla](https://github.com/hoobdeebla): chore(renovate): update typescript as its own group [PR #30909](https://github.com/gatsbyjs/gatsby/pull/30909)
- [P177](https://github.com/P177): fix(docs): replace invalid style prop with emotion css prop in tutorial [PR #31062](https://github.com/gatsbyjs/gatsby/pull/31062)
- [fshowalter](https://github.com/fshowalter): fix(gatsby-transformer-remark): Activate footnotes by default & remove included options with remark v13 [PR #31019](https://github.com/gatsbyjs/gatsby/pull/31019)
- [axe312ger](https://github.com/axe312ger)

  - test(e2e-contentful): add schema.sql for comparison with later updates [PR #31074](https://github.com/gatsbyjs/gatsby/pull/31074)
  - fix(gatsby): upgrade css-minimizer-webpack-plugin to v2 [PR #31176](https://github.com/gatsbyjs/gatsby/pull/31176)

- [joshua-isaac](https://github.com/joshua-isaac): chore(docs): Update sourcing from agility cms [PR #30966](https://github.com/gatsbyjs/gatsby/pull/30966)
- [Auspicus](https://github.com/Auspicus): fix(gatsby-source-drupal): remove computed fields before running createNode on existing node [PR #28682](https://github.com/gatsbyjs/gatsby/pull/28682)
- [mjameswh](https://github.com/mjameswh): fix(webpack-theme-component-shadowing): Support shadowing in yarn-style workspaces with Webpack 5 [PR #30435](https://github.com/gatsbyjs/gatsby/pull/30435)
- [ben-xD](https://github.com/ben-xD): Update Cloudflare Workers Sites deployment documentation [PR #31173](https://github.com/gatsbyjs/gatsby/pull/31173)
- [pedrolamas](https://github.com/pedrolamas): Allows sitemap output on root of public folder [PR #31130](https://github.com/gatsbyjs/gatsby/pull/31130)
- [nrandell](https://github.com/nrandell): Don't remove gatsby-source-filesystem [PR #31069](https://github.com/gatsbyjs/gatsby/pull/31069)
- [ridem](https://github.com/ridem): fix(gatsby-plugin-netlify-cms): Fix typo in semver [PR #31177](https://github.com/gatsbyjs/gatsby/pull/31177)
- [benomatis](https://github.com/benomatis): chore(docs): GATSBY_ACTIVE_ENV is undefined by default [PR #31136](https://github.com/gatsbyjs/gatsby/pull/31136)
- [donno2048](https://github.com/donno2048): chore: Fix grammar error in README [PR #31186](https://github.com/gatsbyjs/gatsby/pull/31186)
- [junaidilyas](https://github.com/junaidilyas): fix(gatsby): add generic type to GatsbyFunctionResponse [PR #31182](https://github.com/gatsbyjs/gatsby/pull/31182)
- [MorrisonCole](https://github.com/MorrisonCole): fix(gatsby-plugin-image): add @babel/core peer dependency [PR #31188](https://github.com/gatsbyjs/gatsby/pull/31188)
- [kimbaudi](https://github.com/kimbaudi): fix(gatsby): rehydration issue in Dev404Page with DEV_SSR [PR #30581](https://github.com/gatsbyjs/gatsby/pull/30581)
- [FlxAlbroscheit](https://github.com/FlxAlbroscheit): docs: Updates file name suggestion in babel.md [PR #31198](https://github.com/gatsbyjs/gatsby/pull/31198)
- [dev-szymon](https://github.com/dev-szymon): added breakpoints to sharp_attributes set in babel-helpers [PR #30451](https://github.com/gatsbyjs/gatsby/pull/30451)
- [tobyglei](https://github.com/tobyglei): chore(docs): Update 21yunbox guide [PR #28848](https://github.com/gatsbyjs/gatsby/pull/28848)
- [pvpg](https://github.com/pvpg): chore(docs): Update sourcing-from-prismic [PR #29237](https://github.com/gatsbyjs/gatsby/pull/29237)
- [gabo2192](https://github.com/gabo2192): docs: Update example to apollo-client v3 [PR #29737](https://github.com/gatsbyjs/gatsby/pull/29737)
- [Js-Brecht](https://github.com/Js-Brecht): fix(gatsby): update plugin api types [PR #30819](https://github.com/gatsbyjs/gatsby/pull/30819)
- [cobraz](https://github.com/cobraz): feat(gatsby-plugin-image): Export ImageDataLike type [PR #30590](https://github.com/gatsbyjs/gatsby/pull/30590)
- [Hannah-goodridge](https://github.com/Hannah-goodridge): chore(docs): Update MDX frontmatter for programmatic pages [PR #29798](https://github.com/gatsbyjs/gatsby/pull/29798)
- [alowdon](https://github.com/alowdon): chore(docs): Update "Adding Search with Algolia" guide [PR #29460](https://github.com/gatsbyjs/gatsby/pull/29460)
- [YehudaKremer](https://github.com/YehudaKremer): fix(gatsby-plugin-image): print error details [PR #30417](https://github.com/gatsbyjs/gatsby/pull/30417)
- [kelvindecosta](https://github.com/kelvindecosta): docs(gatsby-plugin-image): Add docs for customizing default options [PR #30344](https://github.com/gatsbyjs/gatsby/pull/30344)
