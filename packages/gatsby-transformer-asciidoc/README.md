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

## Parsing algorithm

It recognizes files with the following extensions as AsciiDoc:

- adoc

Each Markdown file is parsed into a node of type `asciidoc`.


## How to query

A sample GraphQL query to get AsciiDoc nodes:

```graphql
{
  allAsciidoc {
    edges {
      node {
        html
        relativePath
      }
    }
  }
}
```

## Troubleshooting
