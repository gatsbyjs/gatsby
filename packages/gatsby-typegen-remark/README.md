# gatsby-typegen-remark

Provides fields to the `MarkdownRemark` GraphQL type to query common
types of derived markdown data e.g. rendered HTML.

## Install

`npm install --save gatsby-typegen-remark`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  `gatsby-typegen-remark`,
]
```

Once installed you can query for `MarkdownRemark` nodes like the
following:

```graphql
{
  allMarkdownRemark {
    edges {
      node {
        html
        excerpt(pruneLength: 300)
        timeToRead
        headings {
          value
          depth
        }
        frontmatter {
          title
        }
      }
    }
  }
}
```

The `html`, `excerpt`, `timeToRead`, and `headings` fields are all provided by
this plugin. The `title` field on the `frontmatter` sub-object is
inferred from the data parsed by `gatsby-parser-remark`.

Some fields, such as `excerpt`, can take additional arguments like
`pruneLength`.

## Remark plugin ecosystem.

There are many Gatsby plugins which have been written to modify how
Markdown is converted into HTML.

Official Gatsby Remark plugins include:

* gatsby-typegen-remark-autolink-headers
* gatsby-typegen-remark-copy-linked-files
* gatsby-typegen-remark-prismjs
* gatsby-typegen-remark-responsive-iframe
* gatsby-typegen-remark-responsive-image
* gatsby-typegen-remark-smartypants

As Gatsby plugins can accept their own plugins, you add remark plugins
to your sites like the following:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-typegen-remark`,
    options: {
      plugins: [
        {
          resolve: `gatsby-typegen-remark-responsive-image`,
          options: {
            maxWidth: 590,
          },
        },
        {
          resolve: `gatsby-typegen-remark-responsive-iframe`,
          options: {
            wrapperStyle: `margin-bottom: 1.0725rem`,
          },
        },
        `gatsby-typegen-remark-prismjs`,
        `gatsby-typegen-remark-copy-linked-files`,
        `gatsby-typegen-remark-smartypants`,
      ],
    },
  },
]
```
