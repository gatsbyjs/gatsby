---
date: "2023-01-24"
version: "5.5.0"
title: "v5.5 Release Notes"
---

Welcome to `gatsby@5.5.0` release (January 2023 #2)

Key highlights of this release:

- [Faster Hashing for `gatsby-source-filesytem`](#faster-hashing-for-gatsby-source-filesytem)

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

## Editing `<html>` and `<body>` attributes

You can now edit the attributes of the `<html>` and `<body>` tags using the Head API. Gatsby will automatically incorporate these attributes into the page, with any attributes specified in the Head API taking precedence over those set through [Gatsby Server Rendering APIs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/)

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

## Contributors

A big **Thank You** to [our community who contributed][full-changelog] to this release 💜

TODO

[full-changelog]: https://github.com/gatsbyjs/gatsby/compare/gatsby@5.5.0-next.0...gatsby@5.5.0
