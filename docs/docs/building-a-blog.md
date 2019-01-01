---
title: Building a blog
---


### Building a blog

Using gatsby-starter-blog you will build a full-featured blog. 

### Prerequisites

You must know how to set up a basic Gatsby project based on a starter. If you need to, check the [main tutorial](https://www.gatsbyjs.org/tutorial).

### Setting up blog metadata

Edit the siteMetadata to set the site title, author, and other properties: 

```js:title=gatsby-config.js
siteMetadata: {
    title: `Gatsby Starter Blog`,
    author: `Kyle Mathews`,
    description: `A starter blog demonstrating what Gatsby can do.`,
    siteUrl: `https://gatsby-starter-blog-demo.netlify.com/`,
    social: {
      twitter: `kylemathews`,
    },
 },
```

### Adding articles

To create an article, add a new folder to `/content/blog/`. The name of this folder is the route on which the article is available. You write the article itself in the `index.md` file under the created folder. 

#### Article metadata

All the article metadata such as the `title` come from the header of the index.md file. You can access this data under the `frontmatter` object. 

content/blog/hello-world/index.md
---
title: Hello World
date: '2015-05-01T22:12:03.284Z'
 ---

#### Adding more data to frontmatter

You can include more data in `frontmatter` like `readTime` for example. To use this data, you also have to change the page queries that are reading this data:

```js:title=src/templates/blog-post.js
frontmatter {
 title
 date(formatString: "MMMM DD, YYYY")
 readTime
}
`
```

```js:title=src/pages/index.js
frontmatter {
 date(formatString: "MMMM DD, YYYY")
 title
 readTime
}
`
```
