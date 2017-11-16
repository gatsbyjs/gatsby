---
title: "Using Excerpts"
date: "2017-11-14"
draft: false
author: Jay Gatsby
tags:
  - remark
  - excerpts
---

`gatsby-transformer-remark` allows you to get an excerpt from a markdown post. By default, it will grab the first 140 characters, but you can optionally specify a `pruneLength` in the graphql query.

```graphql
{
	allMarkdownRemark {
	  edges {
	    node {
	    	excerpt(pruneLength:280)
	    }
	  }
	}
}
```

`gatsby-transformer-remark` uses [gray-matter]() to parse markdown frontmatter. You can specify gray-matter's excerpt_separator, as well as any of the other gray-matter options mentioned [here](), in the `gatsby-config.js` file.

```json
{
    resolve: `gatsby-transformer-remark`,
    options: {
        excerpt_separator: `<!-- end -->`
    }
}
```

You can see the results [here](/excerpt-example)