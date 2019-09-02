---
title: "Implementing a Draft Feature in a Gatsby Blog"
date: 2019-09-02
author: Emeruche "Cole" Ikenna
excerpt: "This covers how to implement a draft system in your GatsbyJS-powered blog."
tags:
  - blogs
  - markdown
---
![five brown pencils](./image.jpg)
_Hello there, fellow Gatsby blog owner!_
Recently, I've found myself thinking and writing about GatsbyJS. Mostly because, like Bootstrap and React, it's one of the best thing that has happened to me since I started learning front-end development. And now I'm going to share something (not-so-new) I learnt.

When I started out building my portfolio-cum-blog website with Gatsby and actually started writing, I came across an issue. For someone who also writes on [Dev.to](https://dev.to) - where you can start writing out an article, only to _draft_ it and move onto a new one - I got a bit disappointed why uptil now, Gatsby's [blog starter](https://www.gatsbyjs.org/starters/gatsbyjs/gatsby-starter-blog/) does not include a built-in functionality of saving drafts and only publishing posts you set as "published", as seen on Dev.to.

>There are other alternatives to this which I found online. Links to them will be listed at the end of this article.
>Also this article assumes you're running a blog powered by Gatsby's `gatsby-starter-blog`

My first thought on how to solve this was looking for the chunk of code that handles creation of pages from Markdown files, and I found this in `gatsby-node.js`:
```js
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    throw result.errors
  }

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    })
  })
}
```
As you can rightly guess, the pages are created from data gotten with the `allMarkdownRemark` query. This is where we can work our magic.

Right next to the `sort` command, we can add our own `filter` rule to get only posts we mark as published. To do this, you should add a variable `published` in your articles' frontmatter, which is set to `true` or `false` depending on the status of the article. For example, to set an article as a draft (i.e unpublshed) add this to the file's front matter: `published: false`.

Now that we have a way of marking posts as ready to be published or not, we get back to the GraphQL query and change it like so:
```js
exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)
  const result = await graphql(
    `
      {
        allMarkdownRemark(sort: {fields: frontmatter___date, order: DESC}, filter: {frontmatter: { published: {eq: true} }}, limit: 1000)
        ...

        slug: post.node.fields.slug,
        previous,
        next,
      },
    })
  })
}
```

This change ensures that Gatsby only filters out posts we set it's published variable to `true` in it's fromtmatter.
Please note to add this rule to wherever else you are doing some tasks with your posts, eg when in your `src/pages/index.js` file, where there's a similar query for listing out your articles, and also if you're creating your RSS feed with `gatsby-plugin-feed`.

As I stated before I started, there are other alternatives around the web for this. Check out this method by [Janosh](https://www.google.com.ng/url?sa=t&source=web&rct=j&url=https://janosh.io/blog/exclude-drafts-from-production/&ved=2ahUKEwi99uvmz63kAhVRQxUIHbWLAJ4QFjAAegQIAxAB&usg=AOvVaw3jun-nNSBWsJ8Gqq71dGYi) and this one by [Chase Adams](https://chaseonsoftware.com/gatsby-drafts/#how-i-write-drafts-in-gatsby). Use whichever method you prefer, and if you have your own super cool method for this, please share with us some code snippets in the comment sections or paste the link to the article.

