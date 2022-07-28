# gatsby-transformer-asciidoc

Parses AsciiDoc files using [Asciidoctor.js](https://asciidoctor.org/docs/asciidoctor.js/).

## Install

```shell
npm install gatsby-transformer-asciidoc
```

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-transformer-asciidoc`]
```

A full explanation of asciidoc can be found here: [Asciidoctor.js](https://github.com/asciidoctor/asciidoctor.js)

You can also pass all [Asciidoctor's convert options](https://asciidoctor-docs.netlify.app/asciidoctor.js/processor/convert-options/) to the transformer. An example would be:

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
- `asciidoc`

Additional extensions can be configured via the fileExtensions option:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-asciidoc`,
    options: {
      attributes: {
        showtitle: true,
      },
      fileExtensions: [`ad`, `adoc`],
    },
  },
]
```

Each AsciiDoc file is parsed into a node of type `asciidoc`.

## Set imagesdir

You also can define where the asciidoc file can find the images by setting the imagesdir attribute.

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-asciidoc`,
    options: {
      attributes: {
        imagesdir: `/images`,
      },
    },
  },
]
```

In the asciidoc file you can insert your image just by using:
`image::myimage.png[]`

**NOTE**

- If no `imagesdir` is set the default value is `/images@`
- Don't use relative images paths because the images might not be copied automatically to the location where the converted asciidoc html file will to located.
- In case a `pathPrefix` is set it will altered the images location.
- In case you want to be able to override the defined imagesdir inside of your asciidoc file you have to end the path with a `@` (e.g. `/images@`).

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

## Add new node attributes in the asciidoc file

You can define in the asciidoc file your own data that will be automatically be attached to the node attributes.

**Example**

```asciidoc
= AsciiDoc Article Title
Firstname Lastname <author@example.org>
1.0, July 29, 2018, Asciidoctor article template

:page-title: Article
:page-path: /my-blog-entry
:page-category: My Category

```

Each attribute with the prefix page- will be automatically added under `pageAttributes` so it can be used with GraphQL.

```graphql
{
  allAsciidoc {
    edges {
      node {
        pageAttributes {
          title
          path
          category
        }
      }
    }
  }
}
```

## Define a Custom Converter

You can define a custom converter by adding the `converterFactory` option.

```javascript
// In your gatsby-config.js, make sure to import or declare CustomConverter
plugins: [
  {
    resolve: `gatsby-transformer-asciidoc`,
    options: {
      converterFactory: CustomConverter,
    },
  },
]
```

`CustomConverter` is a custom javascript class you'll need to create. Information on how to write a custom `CustomConverter` can be found at the [asciidoctor docs](https://asciidoctor-docs.netlify.app/asciidoctor.js/extend/converter/custom-converter/).

In the example below, we will use a custom converter to convert paragraphs but the other nodes will be converted using the built-in HTML5 converter:

```javascript
const asciidoc = require(`asciidoctor`)()

class CustomConverter {
  constructor() {
    this.baseConverter = asciidoc.Html5Converter.$new()
  }

  convert(node, transform) {
    if (node.getNodeName() === "paragraph") {
      return `<p>${node.getContent()}</p>`
    }

    return this.baseConverter.convert(node, transform)
  }
}
```

gatsby-transformer-asciidoc takes then this class, **not** a instance of `CustomConverter`, as the `converterFactory` option.
You can also reuse the internal converter of gatsby-transformer-asciidoc, since the constructor of a given `CustomConverter` will be call with it as parameter.
