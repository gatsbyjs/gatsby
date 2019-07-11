# gatsby-transformer-xml

Parses XML files. It supports also attributes

## Install

`npm install --save gatsby-transformer-xml`

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-transformer-xml`]
```

**With options**

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-xml`,
    options: {
      // Whether to trim whitespace characters that may exist before and after the text.
      trim: false,
      // Whether to attempt converting text of numerals or of boolean values to native type. For example, "123" will be 123 and "true" will be true
      nativeType: false,
      // Whether to ignore parsing declaration property. That is, no declaration property will be generated.
      ignoreDeclaration: true,
      // Whether to ignore parsing comments of the elements. That is, no comment will be generated.
      ignoreComment: true,
      // Whether to ignore parsing processing instruction property. That is, no instruction property will be generated.
      ignoreInstruction: false,
      // Whether to ignore parsing attributes of elements.That is, no attributes property will be generated.
      ignoreAttributes: false,
      // Whether to ignore parsing CData of the elements. That is, no cdata will be generated.
      ignoreCdata: false,
      // Whether to ignore parsing Doctype of the elements. That is, no doctype will be generated.
      ignoreDoctype: false,
      // Whether to ignore parsing texts of the elements. That is, no text will be generated.
      ignoreText: false,
      // Use Legacy output format (nodes have xmlChildren array with key value-pairs of name/content)
      useLegacyOutput: false,
    },
  },
],
```

## Migration from 2.x to 3.x

Version 3 of this plugin is backwards compatible with the output format provided by 2.x. Just set the `useLegacyOutput` to true, and you should be good to go.

## Parsing algorithm

The algorithm for arrays is to convert each item in the array into a node.

So if your project has a `books.xml` with

```xml
<?xml version="1.0"?>
<catalog>
  <book id="bk101">
      <author>Gambardella, Matthew</author>
      <title>XML Developer's Guide</title>
      <genre>Computer</genre>
      <price>44.95</price>
      <publish_date>2000-10-01</publish_date>
      <description>An in-depth look at creating applications
      with XML.</description>
      <description_html><![CDATA[<p>An in-depth look at creating applications with XML.</p>]]></description_html>
   </book>
   <book id="bk102">
      <author>Ralls, Kim</author>
      <title>Midnight Rain</title>
      <genre>Fantasy</genre>
      <price>5.95</price>
      <publish_date>2000-12-16</publish_date>
      <description>A former architect battles corporate zombies,
      an evil sorceress, and her own childhood to become queen
      of the world.</description>
      <description_html><![CDATA[<p>A former architect battles <strong>corporate zombies</strong>, an evil sorceress, and her own childhood to become queen of the world.</p>]]></description_html>
   </book>
</catalog>
```

The plugin uses [xml-js](https://www.npmjs.com/package/xml-js) to convert it to json

```json
{
  "declaration": {
    "attributes": {
      "version": "1.0"
    }
  },
  "root": {
    "name": "catalog",
    "attributes": {},
    "children": [
      {
        "name": "book",
        "attributes": {
          "id": "bk101"
        },
        "author": {
          "text": "Gambardella, Matthew",
        },
        "children": [],
        "description": {
          "text": "An in-depth look at creating applications
              with XML.",
        },
        "description_html": {
          "cdata": "<p>An in-depth look at creating applications
              with XML.</p>",
        },
        "genre": {
          "text": "Computer",
        },
        "id": "bk101",
        "internal": {
          "contentDigest": "contentDigest",
          "type": "NodeNameXml",
        },
        "parent": "whatever",
        "price": {
          "text": "44.95",
        },
        "publish_date": {
          "text": "2000-10-01",
        },
        "title": {
          "text": "XML Developer's Guide",
        },
      },
      {
        "name": "book",
        "attributes": {
          "id": "bk102"
        },
        "author": {
          "text": "Ralls, Kim",
        },
        "children": [],
        "description": {
          "text": "A former architect battles corporate zombies,
              an evil sorceress, and her own childhood to become queen
              of the world.",
        },
        "description_html": {
          "cdata": "<p>A former architect battles <strong>corporate zombies</strong>,
              an evil sorceress, and her own childhood to become queen
              of the world.</p>",
        },
        "genre": {
          "text": "Fantasy",
        },
        "id": "bk102",
        "internal": {
          "contentDigest": "contentDigest",
          "type": "NodeNameXml",
        },
        "parent": "whatever",
        "price": {
          "text": "5.95",
        },
        "publish_date": {
          "text": "2000-12-16",
        },
        "title": {
          "text": "Midnight Rain",
        },
      }
    ],
  }
}
```

Which then is used to create the nodes.

## How to query

You'd be able to query your books like:

```graphql
{
  allBooksXml {
    edges {
      node {
        attributes {
          id
        }
        author {
          text
        }
        title {
          text
        }
        genre {
          text
        }
        price {
          text
        }
        publish_date {
          text
        }
        description {
          text
        }
        description_html {
          cdata
        }
      }
    }
  }
}
```

Which would return:

```javascript
{
  "data": {
    "allBooksXml": {
      "edges": [
        {
          "node": {
            "attributes": {
              "id": "bk101"
            },
            "author": {
              "text": "Gambardella, Matthew"
            },
            "title": {
              "text": "XML Developer's Guide"
            },
            "genre": {
              "text": "Computer"
            },
            "price": {
              "text": "44.95"
            },
            "publish_date": {
              "text": "2000-10-01"
            },
            "description": {
              "text": "An in-depth look at creating applications with XML."
            },
            "description_html": {
              "cdata": "<p>An in-depth look at creating applications with XML.</p>"
            }
          }
        },
        {
          "node": {
            "attributes": {
              "id": "bk102"
            },
            "author": {
              "text": "Ralls, Kim"
            },
            "title": {
              "text": "Midnight Rain"
            },
            "genre": {
              "text": "Fantasy"
            },
            "price": {
              "text": "5.95"
            },
            "publish_date": {
              "text": "2000-12-16"
            },
            "description": {
              "text": "A former architect battles corporate zombies, an evil sorceress, and her own childhood to become queen of the world."
            },
            "description_html": {
              "cdata": "<p>A former architect battles <strong>corporate zombies</strong>, an evil sorceress, and her own childhood to become queen of the world.</p>"
            }
          }
        }
      ]
    }
  }
}
```

Note that the root element "catalog" is ignored, and nodes are created with the children elements.

## How to query (LEGACY MODE)

You'd be able to query your books like:

```graphql
{
  allBooksXml {
    edges {
      node {
        name
        xmlChildren {
          name
          content
        }
      }
    }
  }
}
```

Which would return:

```json
{
  "data": {
    "allBooksXml": {
      "edges": [
        {
          "node": {
            "name": "book",
            "xmlChildren": [
              {
                "name": "author",
                "content": "Gambardella, Matthew"
              },
              {
                "name": "title",
                "content": "XML Developer's Guide"
              },
              {
                "name": "genre",
                "content": "Computer"
              },
              {
                "name": "price",
                "content": "44.95"
              },
              {
                "name": "publish_date",
                "content": "2000-10-01"
              },
              {
                "name": "description",
                "content": "An in-depth look at creating applications\n      with XML."
              }
            ]
          }
        },
        {
          "node": {
            "name": "book",
            "xmlChildren": [
              {
                "name": "author",
                "content": "Ralls, Kim"
              },
              {
                "name": "title",
                "content": "Midnight Rain"
              },
              {
                "name": "genre",
                "content": "Fantasy"
              },
              {
                "name": "price",
                "content": "5.95"
              },
              {
                "name": "publish_date",
                "content": "2000-12-16"
              },
              {
                "name": "description",
                "content": "A former architect battles corporate zombies,\n      an evil sorceress, and her own childhood to become queen\n      of the world."
              }
            ]
          }
        }
      ]
    }
  }
}
```
