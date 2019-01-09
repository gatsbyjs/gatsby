# gatsby-transformer-remark

Parses Markdown files using [Remark](http://remark.js.org/).

## Install

`npm install --save gatsby-transformer-remark`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      // CommonMark mode (default: true)
      commonmark: true,
      // Footnotes mode (default: true)
      footnotes: true,
      // Pedantic mode (default: true)
      pedantic: true,
      // GitHub Flavored Markdown mode (default: true)
      gfm: true,
      // Plugins configs
      plugins: [],
    },
  },
],
```

The following parts of `options` are passed down to Remark as options:

- `options.commonmark`
- `options.footnotes`
- `options.pedantic`
- `options.gfm`

The details of the Remark options above could be found in [`remark-parse`'s documentation](https://github.com/remarkjs/remark/tree/master/packages/remark-parse#processoruseparse-options)

A full explanation of how to use markdown in Gatsby can be found here:
[Creating a Blog with Gatsby](https://www.gatsbyjs.org/blog/2017-07-19-creating-a-blog-with-gatsby/)

There are many Gatsby Remark plugins which you can install to customize how Markdown is processed. Many of them are demoed at https://using-remark.gatsbyjs.org/. See also the [source code for using-remark](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-remark).

## Parsing algorithm

It recognizes files with the following extensions as Markdown:

- md
- markdown

Each Markdown file is parsed into a node of type `MarkdownRemark`.

All frontmatter fields are converted into GraphQL fields. TODO link to docs on
auto-inferring types/fields.

This plugin adds additional fields to the `MarkdownRemark` GraphQL type
including `html`, `excerpt`, `headings`, etc. Other Gatsby plugins can also add
additional fields.

## How to query

A sample GraphQL query to get MarkdownRemark nodes:

```graphql
{
  allMarkdownRemark {
    edges {
      node {
        html
        headings {
          depth
          value
        }
        frontmatter {
          # Assumes you're using title in your frontmatter.
          title
        }
      }
    }
  }
}
```

### Getting table of contents

Using the following GraphQL query you'll be able to get the table of contents

```graphql
{
  allMarkdownRemark {
    edges {
      node {
        html
        tableOfContents(pathToSlugField: "frontmatter.path")
        frontmatter {
          # Assumes you're using path in your frontmatter.
          path
        }
      }
    }
  }
}
```

By default the tableOfContents is using the field `slug` to generate URLs. You can however provide another field using the pathToSlugField parameter. **Note** that providing a non existing field will cause the result to be null.

### Excerpts

#### Length

By default, excerpts have a maximum length of 140 characters. You can change the default using the `pruneLength` argument. For example, if you need 500 characters, you can specify:

```graphql
{
  allMarkdownRemark {
    edges {
      node {
        html
        excerpt(pruneLength: 500)
      }
    }
  }
}
```

#### Format

By default, Gatsby will return excerpts as plain text. This might be useful for populating [opengraph](https://en.wikipedia.org/wiki/Facebook_Platform#Open_Graph_protocol) HTML tags for SEO reasons. You can also explicitly specify a `PLAIN` format like so:

```graphql
{
  allMarkdownRemark {
    edges {
      node {
        excerpt(format: PLAIN)
      }
    }
  }
}
```

It's also possible to ask Gatsby to return excerpts formatted as HTML. You might use this if you have a blog post whose an excerpt contains markdown content--e.g. header, link, etc.--and you want these links to render as HTML.

```graphql
{
  allMarkdownRemark {
    edges {
      node {
        excerpt(format: HTML)
      }
    }
  }
}
```

## gray-matter options

`gatsby-transformer-remark` uses [gray-matter](https://github.com/jonschlinkert/gray-matter) to parse markdown frontmatter, so you can specify any of the options mentioned [here](https://github.com/jonschlinkert/gray-matter#options) in the `gatsby-config.js` file.

### Example: Excerpts

If you don't want to use `pruneLength` for excerpts but a custom seperator, you can specify an `excerpt_separator`:

```javascript
{
  "resolve": `gatsby-transformer-remark`,
  "options": {
    "excerpt_separator": `<!-- end -->`
  }
}
```

Any file that does not have the given `excerpt_separator` will fall back to the default pruning method.

## Troubleshooting

### Excerpts for non-latin languages

By default, `excerpt` uses `underscore.string/prune` which doesn't handle non-latin characters ([https://github.com/epeli/underscore.string/issues/418](https://github.com/epeli/underscore.string/issues/418)).

If that is the case, you can set `truncate` option on `excerpt` field, like:

```graphql
{
  markdownRemark {
    excerpt(truncate: true)
  }
}
```
