---
title: Adding pagination
draft: true
---

A page displaying a list of content gets longer as the amount of content grows.
Pagination is the technique of spreading that content across multiple pages.

The goal is to create multiple pages (from a single [template](https://www.gatsbyjs.org/docs/building-with-components/#page-template-components)) that show a limited number of items.

Each page will [query GraphQL](https://www.gatsbyjs.org/docs/querying-with-graphql/) for the items it wants to display.

The information needed to query for those specific items will come from the [pageContext](https://www.gatsbyjs.org/docs/graphql-reference/#query-variables) that is added when [creating pages](https://www.gatsbyjs.org/docs/creating-and-modifying-pages/#creating-pages-in-gatsby-nodejs) in `gatsby-node`

> You can access the values stored in the `pageContext` from withing your GraphQL query

### Example

```js
// in src/templates/blog-list-template.js

import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"

export default class BlogList extends React.Component {
  render() {
    const posts = this.props.data.allMarkdownRemark.edges
    return (
      <Layout>
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug
          return <div key={node.fields.slug}>{title}</div>
        })}
      </Layout>
    )
  }
}

export const blogListQuery = graphql`
  query blogListQuery($skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      limit: $limit
      skip: $skip
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
```

```js
// in gatsby-node.js

const path = require("path")
const { createFilePath } = require("gatsby-source-filesystem")

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  return new Promise((resolve, reject) => {
    resolve(
      graphql(
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
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          reject(result.errors)
        }

        // Create blog-list pages
        const posts = result.data.allMarkdownRemark.edges
        const postsPerPage = 6
        const numPages = Math.ceil(posts.length / postsPerPage)

        Array.from({ length: numPages }).forEach((_, i) => {
          createPage({
            path: `/blog/${i + 1}`,
            component: path.resolve("./src/templates/blog-list-template.js"),
            context: {
              limit: postsPerPage,
              skip: i * postsPerPage,
            },
          })
        })
      })
    )
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
```

The code above will create a dynamic amount of pages that is based off the total number of blogposts. Each page will list `postsPerPage`(6) posts, until there are less than `postsPerPage`(6) posts left.
The urls will be `/blog/1`, `/blog/2`, `/blog/3` etc.

### Other resources

[A step by step blog-post](https://nickymeuleman.netlify.com/blog/gatsby-pagination/) that also places a link to the previous/next page and adds the traditional page-number-navigation at the bottom of the page
If there are other resources you think readers would benefit from or next steps they might want to take after reading your article, add
them at the bottom in an "Other Resources" section. You can also mention here any resources that helped you write the article (blogposts, outside tutorials, etc.).

- Link to a blogpost
- Link to a YouTube tutorial
- Link to an example site
- Link to source code for a live site
- Links to relevant plugins
- Links to starters
