---
date: "2021-06-08"
version: "3.7.0"
title: "v3.7 Release Notes"
---

# [v3.7](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.7.0-next.0...gatsby@3.7.0) (June 2021 #1)

Welcome to `gatsby@3.7.0` release (June 2021 #1)

Key highlights of this release:

- [Functions](#functions) - Now generally available
- [webpack caching](#webpack-caching) - Starting gradual rollout
- [New API for source plugins: `createNodeManifest`](#new-api-for-source-plugins-createnodemanifest)
- [Experimental: Node persistence in LMDB](#experimental-node-persistence-in-lmdb) - Lower peak memory usage
- [`gatsby-remark-images`: async image decoding by default](#gatsby-remark-images-async-image-decoding-by-default)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know
if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v3.6)

[Full changelog](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.7.0-next.0...gatsby@3.7.0)

---

## Functions

[Functions](/docs/reference/functions/), first class support for serverless functions is now generally available in this version of Gatsby. Learn more about functions in the [documentation](/docs/reference/functions/) and [examples](https://github.com/gatsbyjs/gatsby/tree/master/examples).

If you've been using it as an experimental feature for a while, you no longer need to include the experimental `FUNCTIONS` flag to use it after this update.

## webpack caching

webpack 5 introduced [built-in persistent caching](https://webpack.js.org/blog/2020-10-10-webpack-5-release/#persistent-caching).
It allows webpack to reuse results of previous compilations and significantly speed up compilation steps.

We've added this feature in [3.4 release](/docs/reference/release-notes/v3.4/)
behind a flag. Now we are starting a gradual rollout for everyone. This release enables it for 20% of users.

If you encounter any issues, please let us know in the [umbrella discussion](https://github.com/gatsbyjs/gatsby/discussions/31525).

## New API for source plugins: `createNodeManifest`

This new API will be used to write out information that ties the state of some CMS content to a finally built page.
Useful for routing to previews or even production content once they're built.

This release adds a new public action `unstable_createNodeManifest` which is used to tie a manifest ID
(a CMS id that maps to a unique revision state of some content) to a page that was built from a specific node.

To make the mapping from node to page more accurate, this release introduces a new argument to the `createPage` helper,
`ownerNodeId` so that a user can specify that a page is owned by a specific node.

In the case that no `ownerNodeId` is provided, the logic checks for a page with an `id` variable in page context that
matches to the node id of the node manifest. If neither of those exist the logic maps the manifest to the first
page the node is found on in query tracking.

The result is that a source plugin can allow a CMS to create a manifest file using a CMS ID that maps to a finally built page in Gatsby, allowing for a service to redirect to the right page after a build is complete.

[Original PR](https://github.com/gatsbyjs/gatsby/pull/31127).

# Experimental: Node persistence in LMDB

This release introduces a new experimental data storage option: LMDB (via the excellent [lmdb-store](github.com/DoctorEvidence/lmdb-store) package).

Instead of keeping nodes in memory (as it's in Redux), they are instantly saved to this persistent embeddable storage.
This will be beneficial for larger sites that can run into OOMs when persisting redux state to disk.
Several other performance improvements using this new data store will follow.

We encourage you to try it and [let us know](https://github.com/gatsbyjs/gatsby/discussions/31769) if you encounter any issues!

Installation instructions are in the [Umbrella Discussion](https://github.com/gatsbyjs/gatsby/discussions/31769).

[Original PR](https://github.com/gatsbyjs/gatsby/pull/31371)

## gatsby-remark-images: async image decoding by default

Added new plugin option `decoding` that adds corresponding attribute to all `img` tags produced by the plugin.
Default value is `async` (other allowed values are: `sync` or `auto`).

The `decoding` property allows you to control if the browser is allowed to try to parallelize loading your image.
If doing so would cause problems, you can specify `sync` to disable asynchronous loading.

[Original PR](https://github.com/gatsbyjs/gatsby/pull/31558)

[Read more about the `decode` property](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decoding).

## Notable bugfixes & improvements

- Better detection of Babel rules for HMR when customizing the webpack config, via [PR #31477](https://github.com/gatsbyjs/gatsby/pull/31477)
- Correct config for svgo plugins, via [PR #31620](https://github.com/gatsbyjs/gatsby/pull/31620)
- `gatsby-plugin-gatsby-cloud`: Fixed `Maximum call stack size exceeded` error, via [PR #31547](https://github.com/gatsbyjs/gatsby/pull/31547)
- `gatsby-source-contentful`: Fix blinking progress bar, via [PR #31467](https://github.com/gatsbyjs/gatsby/pull/31467)
- `gatsby-source-wordpress`: Prevent "EADDRINUSE: address already in use 127.0.0.1" error, via [PR #31710](https://github.com/gatsbyjs/gatsby/pull/31710)
- `gatsby-remark-katext`: Fix compatibility with remark 13, via [PR #31596](https://github.com/gatsbyjs/gatsby/pull/31596)

## Contributors

A big **Thank You** to [our community who contributed](https://github.com/gatsbyjs/gatsby/compare/gatsby@3.7.0-next.0...gatsby@3.7.0) to this release 💜

TODO
