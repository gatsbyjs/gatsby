---
date: "2023-01-24"
version: "5.5.0"
title: "v5.5 Release Notes"
---

Welcome to `gatsby@5.5.0` release (January 2023 #2)

Key highlights of this release:

- [Faster Hashing for `gatsby-source-filesytem`](#faster-hashing-for-gatsby-source-filesytem)
- [Setting `<html>` and `<body>` attributes](#setting-html-and-body-attributes)

Also check out [notable bugfixes](#notable-bugfixes--improvements).

**Bleeding Edge:** Want to try new features as soon as possible? Install `gatsby@next` and let us know if you have any [issues](https://github.com/gatsbyjs/gatsby/issues).

[Previous release notes](/docs/reference/release-notes/v5.4)

[Full changelog][full-changelog]

---

## Faster Hashing for `gatsby-source-filesytem`

GitHub user [FraserThompson](https://github.com/FraserThompson) put up a feature request to [optionally disable MD5 hashing inside `gatsby-source-filesystem`](https://github.com/gatsbyjs/gatsby/discussions/37425). Their site has around ~1000 MP3s (up to 120MB) and 16000 JPGs (around 2-3 MB), so `gatsby-source-fileystem` has to ingest a lot of data! While reading the data an [MD5 hash](https://en.wikipedia.org/wiki/MD5) is generated for each file to attach the [`contentDigest`](/docs/reference/graphql-data-layer/node-interface/#contentdigest) to the `File` node. Or in other words: This MD5 hash is used to determine if a file has changed and is used in Gatsby's caching system.

We'd recommend reading the discussion inside the feature request as it shows a great case of collaboration and how productive open source work can look like. After exploring and debating about the best approach, the [PR #37464](https://github.com/gatsbyjs/gatsby/pull/37464) was put up. Here's what has changed:

- `gatsby-source-filesystem` now uses [hash-wasm](https://github.com/Daninet/hash-wasm) to calculate the MD5 hash for each file
- Cache the `inode` and `mtime` file stats and only re-generate the MD5 hash if those changed
- Introduce a new `fastHash` option to skip the MD5 hashing altogether. Instead, use the `inode` and `mtime`. On a modern OS this can be considered a robust solution to determine if a file has changed, however on older systems it can be unreliable. Therefore it's not enabled by default.

  ```js:title=gatsby-config.js
  module.exports = {
    plugins: [
      {
        resolve: `gatsby-source-filesystem`,
        options: {
          name: `data`,
          path: `${__dirname}/src/data/`,
          // highlight-next-line
          fastHash: true,
        },
      },
    ],
  }
  ```

[FraserThompson](https://github.com/FraserThompson) also put these changes to the test with this test environment: 4774 files, 3363 images (1-3MB each), 284 MP3s (20-120MB each).

And here are the performance numbers 🚀

| Configuration                                   | `source and transform nodes` (cold) |
| ----------------------------------------------- | ----------------------------------- |
| `gatsby-source-filesytem@5.4.0`                 | 781 seconds                         |
| `gatsby-source-filesytem@5.5.0`                 | 494 seconds (36% decrease)          |
| `gatsby-source-filesytem@5.5.0` with `fastHash` | 10 seconds (98% decrease)           |

As you can see, already the enhancements achieved through `hash-wasm` are great! However, take these numbers with a grain of salt as your site will be different from the test environment. You'll see bigger absolute improvements with a lot of big files.

Last but not least, it's important to note that the upgrades were made to the `createFileNode` function. So if you're using this utility in your site/plugin, you can also benefit from this.

## Setting `<html>` and `<body>` attributes

You can now set the attributes of the `<html>` and `<body>` tags using the [Head API](/docs/reference/built-in-components/gatsby-head/). Gatsby will automatically incorporate these attributes into the page, with any attributes specified in the [Head API](/docs/reference/built-in-components/gatsby-head/) taking precedence over those set through [Gatsby Server Rendering APIs](/docs/reference/config-files/gatsby-ssr/).

```jsx
export function Head() {
  return (
    <>
      <html lang="en">
      <body className="my-body-class">
      <title>Hello World</title>
    </>
  )
}
```

## Notable bugfixes & improvements

- `gatsby`:
  - pass `serverData` into Gatsby Head, via [PR #37500](https://github.com/gatsbyjs/gatsby/pull/37500)
  - fix regression with `file-loader` imports when `pathPrefix` and/or `assetPrefix` is used, via [PR #37423](https://github.com/gatsbyjs/gatsby/pull/37423)
  - fix `pluginOptionsSchema` not being called for local plugins with `gatsby-node.ts`, via [PR #37443](https://github.com/gatsbyjs/gatsby/pull/37443)
  - support updated `sort` argument syntax in `nodeModel.findAll` function, via [PR #37477](https://github.com/gatsbyjs/gatsby/pull/37477)
- `gatsby-source-contentful`:
  - fix back reference fields disapearing after some content updates, via [PR #37442](https://github.com/gatsbyjs/gatsby/pull/37442)

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

- [FraserThompson](https://github.com/FraserThompson): feat(gatsby-source-filesystem): Only generate hashes when a file has changed, and add an option for skipping hashing [PR #37464](https://github.com/gatsbyjs/gatsby/pull/37464)
- [palmiak](https://github.com/palmiak): chore(docs): Adds Kinsta Application hosting to other services [PR #37476](https://github.com/gatsbyjs/gatsby/pull/37476)
- [beadlespouse](https://github.com/beadlespouse): fix(gatsby-source-shopify): Use `id` as cacheKey for base64 image [PR #37397](https://github.com/gatsbyjs/gatsby/pull/37397)
- [chrissantamaria](https://github.com/chrissantamaria): fix(gatsby): Multi-environment browserslist configs [PR #35081](https://github.com/gatsbyjs/gatsby/pull/35081)
- [labifrancis](https://github.com/labifrancis): chore(docs): Update "Minimal Reproduction" instructions [PR #37231](https://github.com/gatsbyjs/gatsby/pull/37231)
- [markacola](https://github.com/markacola): fix(gatsby): Update `loader.loadPage` to return a Promise on error [PR #37337](https://github.com/gatsbyjs/gatsby/pull/37337)
- [chawes13](https://github.com/chawes13): docs: fix v5 release notes slice example [PR #37465](https://github.com/gatsbyjs/gatsby/pull/37465)
- [sapiensfio](https://github.com/sapiensfio): fix(gatsby-react-router-scroll): fix issues with anchor links [PR #37498](https://github.com/gatsbyjs/gatsby/pull/37498)
- [jonrutter](https://github.com/jonrutter): chore(docs): Fix `ts-jest` import statement in Unit Testing Guide [PR #37411](https://github.com/gatsbyjs/gatsby/pull/37411)

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@5.5.0-next.0...gatsby@5.5.0
