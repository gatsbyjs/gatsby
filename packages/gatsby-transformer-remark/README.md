# gatsby-transformer-remark

Parses Markdown files using [Remark](http://remark.js.org/).

## Install

`npm install --save gatsby-transformer-remark`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  `gatsby-transformer-remark`,
]
```

## Parsing algorithm

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

This plugin adds additional fields to the `MarkdownRemark`
GraphQL type including `html`, `excerpt`, `headers`, etc. Other Gatsby
plugins can also add additional fields.

## Adding custom classes
You can also add custom classes to elements. This is especially useful for custom positioning of images, for example right-aligning:
```markdown
![Octocat](octocat.gif "This is Octocat"){.img .img--right}
```

This will result in the following:
```html
<img class="img img--right" src="octocat.gif" alt="Octocat" title="This is Octocat" />
```

## How to query

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
