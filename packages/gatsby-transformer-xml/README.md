# gatsby-transformer-xml

Parses XML files. It supports also attributes

## Install

`npm install --save gatsby-transformer-xml`

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-transformer-xml`]
```

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
