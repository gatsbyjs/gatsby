---
title: "A Default, 140 Character Excerpt"
draft: false
example: true
author: Daisy Buchanan
---

This example uses the default pruning method.

`gatsby-transformer-remark` allows you to get an excerpt from a markdown post. By default, it will prune the first 140 characters, but you can optionally specify a `pruneLength` in the graphql query.

```graphql
{
  allMarkdownRemark {
    edges {
      node {
        excerpt(pruneLength: 280)
      }
    }
  }
}
```
