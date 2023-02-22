---
title: Adding a List of Markdown Blog Posts
---

Once you have added Markdown pages to your site, you are one step away from being able to list your posts on a dedicated index page.

## Creating posts

As described in [Adding Markdown Pages](/docs/how-to/routing/adding-markdown-pages), you will have to create your posts in Markdown files which will look like this:

```markdown
---
slug: "/blog/my-first-post"
date: "2017-11-07"
title: "My first blog post"
---

Has anyone heard about GatsbyJS yet?
```

## Creating the page

The first step will be to create the page which will display your posts, in `src/pages/`. You can for example use `index.js`.

```jsx:title=src/pages/index.js
import React from "react"
import PostLink from "../components/post-link"

const IndexPage = ({
  data: {
    allMarkdownRemark: { edges },
  },
}) => {
  const Posts = edges
    .filter(edge => !!edge.node.frontmatter.date) // You can filter your posts based on some criteria
    .map(edge => <PostLink key={edge.node.id} post={edge.node} />)

  return <div>{Posts}</div>
}

export default IndexPage
```

## Creating the GraphQL query

Second, you need to provide the data to your component with a GraphQL query. Add it, so that `index.js` looks like this:

```jsx:title=src/pages/index.js
import React from "react"
import { graphql } from "gatsby"
import PostLink from "../components/post-link"

const IndexPage = ({
  data: {
    allMarkdownRemark: { edges },
  },
}) => {
  const Posts = edges
    .filter(edge => !!edge.node.frontmatter.date) // You can filter your posts based on some criteria
    .map(edge => <PostLink key={edge.node.id} post={edge.node} />)

  return <div>{Posts}</div>
}

export default IndexPage

export const pageQuery = graphql`
  query {
    allMarkdownRemark(sort: { frontmatter: { date: DESC }}) {
      edges {
        node {
          id
          excerpt(pruneLength: 250)
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            slug
            title
          }
        }
      }
    }
  }
`
```

## Creating the `PostLink` component

The only thing left to do is to add the `PostLink` component. Create a new file `post-link.js` in `src/components/` and add the following:

```jsx:title=src/components/post-link.js
import React from "react"
import { Link } from "gatsby"

const PostLink = ({ post }) => (
  <div>
    <Link to={post.frontmatter.slug}>
      {post.frontmatter.title} ({post.frontmatter.date})
    </Link>
  </div>
)

export default PostLink
```

This should get you a page with your posts sorted by descending date. You can further customize the `frontmatter` and the page and `PostLink` components to get your desired effects!
