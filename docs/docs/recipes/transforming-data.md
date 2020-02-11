---
title: "Recipes: Transforming Data"
tableOfContentsDepth: 1
---

Transforming data in Gatsby is plugin-driven. Transformer plugins take data fetched using source plugins, and process it into something more usable (e.g. JSON into JavaScript objects, and more).

## Transforming Markdown into HTML

The `gatsby-transformer-remark` plugin can transform Markdown files to HTML.

### Prerequisites

- A Gatsby site with `gatsby-config.js` and an `index.js` page
- A Markdown file saved in your Gatsby site `src` directory
- A source plugin installed, such as `gatsby-source-filesystem`
- The `gatsby-transformer-remark` plugin installed

### Directions

1. Add the transformer plugin in your `gatsby-config.js`:

```js:title=gatsby-config.js
plugins: [
  // not shown: gatsby-source-filesystem for creating nodes to transform
  `gatsby-transformer-remark`
],
```

2. Add a GraphQL query to the `index.js` file of your Gatsby site to fetch `MarkdownRemark` nodes:

```jsx:title=src/pages/index.js
export const query = graphql`
  query {
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
`
```

3. Restart the development server and open GraphiQL at `http://localhost:8000/___graphql`. Explore the fields available on the `MarkdownRemark` node.

### Additional resources

- [Tutorial on transforming Markdown to HTML](/tutorial/part-six/#transformer-plugins) using `gatsby-transformer-remark`
- Browse available transformer plugins in the [Gatsby plugin library](/plugins/?=transformer)
