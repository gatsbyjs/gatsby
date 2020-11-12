---
date: "2020-11-12"
version: "2.26.0"
---

# [v2.26](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.26.0-next.0...gatsby@2.27.0-next.0) (November 2020)

---

Welcome to `gatsby@2.26.0` release (November 2020).
Key highlights of this release:

- [New Image Plugin](#gatsby-plugin-image010-beta) - access static images without GraphQL, high Lighthouse scores again
- [File System Route API](#file-system-route-api) - create pages from your data using filename conventions
- [New Release Process](#new-release-process) - more stability and clarity around Gatsby releases
- [gatsby-source-contentful v4.0](#gatsby-source-contentful400) - new RichText implementation, performance improvements

Other notable changes:

- [gatsby-plugin-mdx](#gatsby-plugin-mdx140) - performance improvements
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

This new API enables you to create pages from your GraphQL data using filename conventions,
e.g. to create individual blog post pages for your blog.

Some examples:

- `src/pages/products/{Product.name}.js` will generate pages for all products with a path like `/products/burger`
- `src/pages/products/{Product.fields__sku}.js` will generate pages for all products with a path like `/products/001923`

See [Full Documentation](https://www.gatsbyjs.com/docs/file-system-route-api/),
[examples](https://github.com/gatsbyjs/gatsby/tree/master/examples/route-api)
and related PR [#27424](https://github.com/gatsbyjs/gatsby/pull/27424).

### Enable compression in the dev server

This lowers the amount of data transferred for one site especially in remote situations.
Most of that drop was from the commons.js bundle.

See PR [#27948](https://github.com/gatsbyjs/gatsby/pull/27948) for details.

## gatsby-plugin-image@0.1.0 (beta)

New image plugin to replace `gatsby-image`, which greatly improves performance (Lighthouse 💯 again)
and adds easy static images (no GraphQL). Part of it is also a new, simpler API for `gatsby-transformer-sharp`.

- [Full announcement and discussion](https://github.com/gatsbyjs/gatsby/discussions/27950)
- [README](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-image)

## gatsby-source-contentful@4.0.0

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

## gatsby-plugin-mdx@1.4.0

There was a significant performance improvement by making a certain node fetching step lazy.
This is especially noticeable at scale. See PR [#27937](https://github.com/gatsby/gatsby/issues/27937) for details.

## Work in progress

### Queries on Demand

When developing a Gatsby site there's no need to run all graphql queries before serving the site.
Instead, Gatsby could run queries for pages as they're requested by a browser.
This would avoid having to wait for slower queries (like image processing) if you're editing an unrelated part of a site.

Try early alpha (and [let us know](https://github.com/gatsbyjs/gatsby/discussions/27620) if you have any issues with it):

```
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

```
npm install gatsby-plugin-sharp@lazy-images
```

Enable in your `gatsby-config.js`:

```js
// in gatsby-config.js
{
  resolve: 'gatsby-plugin-sharp',
  options: {
    experimentalDisableLazyProcessing: true,
  }
}
```

[Details and discussion](https://github.com/gatsbyjs/gatsby/discussions/27603).

### Documentation Reorganization

We’ve heard repeatedly from the community that Gatsby is a powerful tool,
but it has a steep learning curve. We want to make it easier to get started with Gatsby.
And that means having documentation that helps y’all find the information you need when you need it.

[Announcement and discussion](https://github.com/gatsbyjs/gatsby/discussions/27856).

## Contributors

A big **Thank You** to [everyone who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@2.26.0-next.0...gatsby@2.27.0-next.0) to this release 💜
