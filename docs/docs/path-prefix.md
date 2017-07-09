---
title: Adding a Path Prefix
---

Many sites are hosted at something other than the root of their domain.

E.g. a Gatsby blog could live at `example.com/blog/` or a site could be
hosted on Github pages at `example.github.io/my-gatsby-site/`

Each of these sites need a prefix added to all paths on the site.  So a link
to `/my-sweet-blog-post/` should be rewritten to `/blog/my-sweet-blog-post`.

In addition links to various resources (JavaScript, images, CSS) need the same
prefix added.

Luckily, for most sites, this work can be offloaded to Gatsby. Using
[gatsby-link](/docs/packages/gatsby-link/) for internal links ensures those
links will be prefixed correctly. Gatsby ensures that paths created internally
and by webpack are also correctly prefixed.

## Development

During development, write paths as if there was no path prefix e.g. for a blog
hosted at `example.com/blog`, don't add `/blog` to your links. The prefix
will be added when you build for deployment.

## Production build

There are two steps for building a site with path prefixes.

First define the prefix in your site's `gatsby-config.js`.

```javascript
module.exports = {
  // Note: it must *not* have a trailing slash.
  pathPrefix: `/blog`
}
```

Then pass `--prefix-paths` cmd option to Gatsby.

```sh
gatsby build --prefix-paths
```

NOTE: When running the command without the `--prefix-paths` flag, Gatsby ignores your `pathPrefix`.
