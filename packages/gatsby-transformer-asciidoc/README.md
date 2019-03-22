# gatsby-transformer-asciidoc

Parses AsciiDoc files using [Asciidoctor.js](https://asciidoctor.org/docs/asciidoctor.js/).

## Install

`npm install --save gatsby-transformer-asciidoc`

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-transformer-asciidoc`]
```

A full explanation of asciidoc can be found here: [Asciidoctor.js](https://github.com/asciidoctor/asciidoctor.js)

You can also pass all [Asciidoctor's convert options](https://asciidoctor-docs.netlify.com/asciidoctor.js/processor/convert-options/) to the transformer. An example would be:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-asciidoc`,
    options: {
      attributes: {
        showtitle: true,
      },
    },
  },
]
```

## Parsing algorithm

It recognizes files with the following [extensions](https://asciidoctor.org/docs/asciidoc-recommended-practices/#document-extension) as AsciiDoc:

- `adoc`

Each AsciiDoc file is parsed into a node of type `asciidoc`.

## How to query

A sample GraphQL query to get AsciiDoc nodes:

```graphql
{
  allAsciidoc {
    edges {
      node {
        html
        document {
          title
          subtitle
          main
        }
        author {
          fullName
          firstName
          lastName
          middleName
          authorInitials
          email
        }
        revision {
          date
          number
          remark
        }
      }
    }
  }
}
```
