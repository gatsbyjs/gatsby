# Gatsby Parser Remark

Parses Markdown files using [Remark](http://remark.js.org/).

It recongnizes files with the following extensions as Markdown.

* md
* rmd
* mkd
* mkdn
* mdwn
* mdown
* litcoffee
* markdown

Each Markdown file is parsed into a node of type `MarkdownRemark`.

All frontmatter fields are converted into GraphQL fields. TODO link to
docs on auto-inferring types/fields.

`gatsby-typegen-remark` adds additional fields to the `MarkdownRemark`
GraphQL type including `html`, `excerpt`, `headers`, etc. Other Gatsby
plugins can also add additional fields.

A sample GraphQL query to get MarkdownRemark nodes:

```graphql
{
  allMarkdownRemark {
    edges {
      node {
        html
        frontmatter {
          # Assumes you're using title in your frontmatter.
          title
        }
      }
    }
  }
}
```
