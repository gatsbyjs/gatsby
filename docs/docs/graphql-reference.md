---
title: GraphQL Reference
---

*WIP!*

### Filters and Sorting

Gatsby's implementation of GraphQL adds support for operators like sorting and filtering when components are fetching data.

Consider a query to get all blog posts:

```
query IndexQuery {
    allMarkdownRemark {
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "DD MMMM, YYYY")
          }
          excerpt
        }
      }
    }
  }
  ```

Let's say you want to fetch the most recent 10 posts, ordered by date. Also, you want to exclude any posts with which are marked `draft: true` in the frontmatter. You can add sort and filter params like so.

```
query IndexQuery {
    allMarkdownRemark(
      sort: {fields: [frontmatter___date], order: DESC},
      filter: { frontmatter: { draft: { ne: true } } },
      limit: 10
    ) {
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "DD MMMM, YYYY")
          }
          excerpt
        }
      }
    }
  }
  ```

  Gatsby relies on [sift](https://www.npmjs.com/package/sift), enabling MongoDB query syntax for object filtering. This allows Gatsby to support operators like `eq`, `ne`, `in`, `regex`, querying nested fields through the `__` connector, and so forth.

  A good video tutorial on this is [here](https://www.youtube.com/watch?v=Lg1bom99uGM).

