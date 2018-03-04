---
title: "Getting an Excerpt with a Separator"
draft: false
example: true
author: Daisy Buchanan
---

This example uses a custom excerpt_separator.

You can manually mark in your markdown where to stop excerpting—similar to Jekyll. <!-- end -->`gatsby-transformer-remark` uses [gray-matter](https://github.com/jonschlinkert/gray-matter) to parse markdown frontmatter, so you can specify an `excerpt_separator`, as well as any of the other options mentioned [here](https://github.com/jonschlinkert/gray-matter#options), in the `gatsby-config.js` file.


```json
{
  resolve: `gatsby-transformer-remark`,
  options: {
    excerpt_separator: `<!-- end -->`
  }
}
```

Any file that does not have the given `excerpt_separator` will fall back to the default pruning method.
