---
date: "2021-05-11"
version: "3.5.0"
---

# [v3.5](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.5.0-next.0...gatsby@3.5.0) (May 2021 #1)

Welcome to `gatsby@3.5.0` release (May 2021 #1)

Key highlights of this release:

- [Performance improvements](#performance-improvements) - 20% faster CLI startup, up to 20% faster query running, 70% speedup to creating pages
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
- Up to ~20% improvement to running queries by switching to a faster queue library ([fastq](https://www.npmjs.com/package/fastq). The improvements are most noticible if you use the fastest query filters (e.g. `eq` filter on the `id` property) and don't do CPU intensive work in query running e.g. process markdown or MDX. [PR #31269](https://github.com/gatsbyjs/gatsby/pull/31269)

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
- `gatsby-plugin-preact`: enable error-overlay [PR #30613](https://github.com/gatsbyjs/gatsby/pull/30613)
- `gatsby-plugin-sitemap`: allow writing sitemap to the root of the public folder [PR #31130](https://github.com/gatsbyjs/gatsby/pull/31130)
- `gatsby-transformer-remark`: restore support for footnotes [PR #31019](https://github.com/gatsbyjs/gatsby/pull/31019)
- Add `ImageDataLike` as an exported type of `gatsby-plugin-image` [PR #30590](https://github.com/gatsbyjs/gatsby/pull/30590)
- Update the public plugin API types [PR #30819](https://github.com/gatsbyjs/gatsby/pull/30819)

## Contributors

TODO
