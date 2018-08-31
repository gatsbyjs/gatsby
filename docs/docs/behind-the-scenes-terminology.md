## Terminology

Read up on [page creation](/docs/page-creation/) first.

### dataPath

Path to the page's query result. Relative to `/public/static/d/{modInt}`. Name is kebab hash on `path--${jsonName}`-`result->sha1->base64`. E.g

`621/path---blog-2018-07-17-announcing-gatsby-preview-995-a74-dwfQIanOJGe2gi27a9CLKHjamc`

### Redux `jsonDataPaths` namespace (dataPaths)

Map of page `jsonName` to `dataPath`. Updated whenever a new query is run (in [query-runner.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/internal-plugins/query-runner/query-runner.js)). e.g

```
{
  // jsonName -> dataPath
  "blog-2018-07-17-announcing-gatsby-preview-995": "621/path---blog-2018-07-17-announcing-gatsby-preview-995-a74-dwfQIanOJGe2gi27a9CLKHjamc"
}
```

This is also known via the `dataPaths` variable.

### Query result file

`/public/static/d/621/${dataPath}`

E.g

`/public/static/d/621/path---blog-2018-07-17-announcing-gatsby-preview-995-a74-dwfQIanOJGe2gi27a9CLKHjamc.json`

This is the actual result of the GraphQL query that was run for the page `/blog/2018-07-17-announcing-gatsby-preview/`. The contents would look something like:

```javascript
{
  "data": {
    "markdownRemark": {
      "html": "<p>Today we....",
      "timeToRead": 2,
      "fields": {
        "slug": "/blog/2018-07-17-announcing-gatsby-preview/"
      },
      "frontmatter": {
        "title": "Announcing Gatsby Preview",
        "date": "July 17th 2018",
        ...
      },
      ...
    }
  },
  "pageContext": {
    "slug": "/blog/2018-07-17-announcing-gatsby-preview/",
    "prev": {
      ...
    },
    "next": null
  }
}
```

For a query such as:

```javascript
export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      timeToRead
      fields {
        slug
      }
      frontmatter {
        title
        date(formatString: "MMMM Do YYYY")
        ...
      }
      ...
    }
  }
`
```

TODO: Consider Creating a standalone terminology page
