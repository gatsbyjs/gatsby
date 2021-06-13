---
date: "2020-11-12"
version: "2.26.0"
title: "v2.26 Release Notes"
---

# [v2.26](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.26.0-next.0...gatsby@2.26.0) (November 2020)

---

Welcome to `gatsby@2.26.0` release (November 2020).
Key highlights of this release:

- [New Image Plugin (beta)](#gatsby-plugin-image010-beta) - access static images without GraphQL, high Lighthouse scores again
- [File System Route API](#file-system-route-api) - create routes from your data using filename conventions
- [New Release Process](#new-release-process) - more stability and clarity around Gatsby releases
- [`gatsby-source-contentful` v4.0](#gatsby-source-contentful400) - new RichText implementation, performance improvements

Other notable changes:

- [`gatsby-plugin-mdx`](#gatsby-plugin-mdx140) - performance improvements
- [Enable compression in the dev server](#enable-compression-in-the-dev-server) - speeds up remote previews

Sneak peek to next releases:

- [Queries on Demand](#queries-on-demand) - improves `gatsby develop` bootup time
- [Experimental: Lazy images in develop](#experimental-lazy-images-in-develop)
- [Documentation Reorganization](#documentation-reorganization)

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

### New Release Process

We are evaluating a new process that should bring more stability and clarity
to Gatsby releases.

### File System Route API

This new API enables you to create routes from your GraphQL data using filename conventions,
e.g. to create individual blog post pages for your blog. It also allows for creating client-only routes more easily.

Some examples:

- `src/pages/products/{Product.name}.js` will generate pages for all products with a path like `/products/burger`
- `src/pages/products/{Product.fields__sku}.js` will generate pages for all products with a path like `/products/001923`
- `src/pages/users/[id].js` will generate a route like `/users/:id`
- `src/pages/image/[...].js` will generate a route like `/image/*`

See [full documentation](/docs/reference/routing/file-system-route-api/),
[examples](https://github.com/gatsbyjs/gatsby/tree/master/examples/route-api)
and related PR [#27424](https://github.com/gatsbyjs/gatsby/pull/27424).

### Enable compression in the dev server

This lowers the amount of data transferred for one site especially in remote situations.
Most of that drop was from the `commons.js` bundle.

See PR [#27948](https://github.com/gatsbyjs/gatsby/pull/27948) for details.

## `gatsby-plugin-image@0.1.0` (beta)

[New image plugin](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-image) to replace `gatsby-image`, which greatly improves performance (Lighthouse 💯 again) and adds easy static images (no GraphQL). Part of it is also a new, simpler API for `gatsby-transformer-sharp`.

### `StaticImage`

This component is a new, simpler way to use Gatsby's image processing for static images without needing to write GraphQL queries:

```jsx
import React from "react"
import { StaticImage } from "gatsby-plugin-image"

export const Dino = () => (
  <StaticImage width={100} height={100} src="trex.png" alt="T-Rex" />
)
```

### `GatsbyImage`

This is a complete rewrite of the Gatsby Image component, using native lazy loading whenever possible.
In our tests it allows sites whose Lighthouse scores dropped in recent updates to get back to 100s across the board.

### Simpler GraphQL for non-static images

Instead of having to remember lots of different fragments for different image types,
you can pass all your options as field arguments (and get inline help in GraphiQL):

```graphql
query {
  file(relativePath: { eq: "plant.jpg" }) {
    childImageSharp {
      gatsbyImageData(maxWidth: 720, layout: FLUID, placeholder: TRACED_SVG)
    }
  }
}
```

You then use the data like this:

```jsx
import { GatsbyImage, getImage } from "gatsby-plugin-image"

export function Plant({ data }) {
  const imageData = getImage(data.file)
  return <GatsbyImage image={imageData} alt="Plant" />
}
```

- [Details, Migration guide and discussion](https://github.com/gatsbyjs/gatsby/discussions/27950)
- [Documentation](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-image)

## `gatsby-source-contentful@4.0.0`

### New Rich Text Implementation

**Breaking Change**: New rich text implementation for performance and usability. This is only a breaking change if you rely on the Rich Text Contentful field type.

See PR [#25249](https://github.com/gatsbyjs/gatsby/pull/25249) description for details and migration guide.

### Performance improvements

The max of `pageLimit` option was raised from `100` to `1000` (on Contentful's side) which should lead
to significant reduction of remote fetching times.

Note that the default value for the `pageLimit` option is still `100`, so you need to change
it manually in your site config to see performance improvements.

Due to technical limitations, the response payload size is still bound by a hard chunk download
size, so it is possible you may need to use a lower value for your particular site.

## `gatsby-plugin-mdx@1.4.0`

There was a significant performance improvement by making a certain node fetching step lazy.
This is especially noticeable at scale. See PR [#27937](https://github.com/gatsbyjs/gatsby/pull/27937) for details.

## Work in progress

### Queries on Demand

When developing a Gatsby site there's no need to run all graphql queries before serving the site.
Instead, Gatsby could run queries for pages as they're requested by a browser.
This would avoid having to wait for slower queries (like image processing) if you're editing an unrelated part of a site.

Try early alpha (and [let us know](https://github.com/gatsbyjs/gatsby/discussions/27620) if you have any issues with it):

```shell
npm install gatsby@qod
```

Enable in your `gatsby-config.js`:

```js
module.exports = {
  // your existing configuration
  __experimentalQueryOnDemand: true,
}
```

[Details and discussion](https://github.com/gatsbyjs/gatsby/discussions/27620).

### Experimental: Lazy images in develop

We've got some feedback that the more image-heavy your website gets, the slower `gatsby develop`.
This experimental version of `gatsby-plugin-sharp` only does image processing when the page gets requested.

Try early alpha (and [let us know](https://github.com/gatsbyjs/gatsby/discussions/27603) if you have any issues with it):

```shell
npm install gatsby-plugin-sharp@lazy-images
```

Lazy images are enabled by-default in this version.

[Details and discussion](https://github.com/gatsbyjs/gatsby/discussions/27603).

### Documentation Reorganization

We’ve heard repeatedly from the community that Gatsby is a powerful tool,
but it has a steep learning curve. We want to make it easier to get started with Gatsby.
And that means having documentation that helps y’all find the information you need when you need it.

[Announcement and discussion](https://github.com/gatsbyjs/gatsby/discussions/27856).

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.26.0-next.0...gatsby@2.26.0) to this release 💜

- [muescha](https://github.com/muescha)
  - fix(docs): Gatsby README - fix brand name GatsbyJS -> Gatsby [PR #27815](https://github.com/gatsbyjs/gatsby/pull/27815)
  - fix(docs): Update gatsby-plugin-guess-js README [PR #27814](https://github.com/gatsbyjs/gatsby/pull/27814)
  - fix(recipe): add brackets to directory names [PR #27812](https://github.com/gatsbyjs/gatsby/pull/27812)
- [MichaelDeBoey](https://github.com/MichaelDeBoey): chore(gatsby-plugin-cxs): Add pluginOptionsSchema validation [PR #27600](https://github.com/gatsbyjs/gatsby/pull/27600)
- [davad](https://github.com/davad): fix(docs): Update documentation for createPages [PR #27735](https://github.com/gatsbyjs/gatsby/pull/27735)
- [me4502](https://github.com/me4502): fix(gatsby-plugin-sitemap): fixed missing sitemapSize config entry [PR #27866](https://github.com/gatsbyjs/gatsby/pull/27866)
- [axe312ger](https://github.com/axe312ger)
  - Refactor Rich Text implementation in gatsby-source-contentful [PR #25249](https://github.com/gatsbyjs/gatsby/pull/25249)
- [ARKEOLOGIST](https://github.com/ARKEOLOGIST): fix(gatsby-plugin-google-tagmanager): allow functions for defaultDataLayer option [PR #27886](https://github.com/gatsbyjs/gatsby/pull/27886)
- [hoobdeebla](https://github.com/hoobdeebla): fix(renovate): move express-graphql and react-reconciler from minor to major update groups [PR #27101](https://github.com/gatsbyjs/gatsby/pull/27101)
- [StephanWeinhold](https://github.com/StephanWeinhold): chore(docs): Add required `path` import to modifying-pages doc [PR #27883](https://github.com/gatsbyjs/gatsby/pull/27883)
- [ervasive](https://github.com/ervasive): fix(gatsby): Update TS types to allow Node 'parent' to be nullable [PR #26570](https://github.com/gatsbyjs/gatsby/pull/26570)
- [manavm1990](https://github.com/manavm1990): chore(docs): Add children to styled-components doc [PR #27011](https://github.com/gatsbyjs/gatsby/pull/27011)
- [kadhirash](https://github.com/kadhirash): fix(docs): dictionary.txt -> KintoBlock-kintoblock [PR #27580](https://github.com/gatsbyjs/gatsby/pull/27580)
- [jerrydevs](https://github.com/jerrydevs): fix(gatsby-transformer-asciidoc): fails when doc doesn't have title [PR #27865](https://github.com/gatsbyjs/gatsby/pull/27865)
