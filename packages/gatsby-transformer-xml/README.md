# gatsby-transformer-xml

Parses XML files. It supports also attributes

## Install

`npm install --save gatsby-transformer-xml`

## How to use

```javascript
// In your gatsby-config.js
plugins: [`gatsby-transformer-xml`];
```

## Parsing algorithm

The algorithm for arrays is to convert each item in the array into a node.

So if your project has a `bookss.xml` with

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
   </book>
</catalog>
```

Then the following 2 nodes will be created

```javascript
{
   "root":{
      "name":"catalog",
      "attributes":{

      },
      "children":[
         {
            "name":"book",
            "attributes":{
               "id":"bk101"
            },
            "children":[
               {
                  "name":"author",
                  "attributes":{

                  },
                  "children":[

                  ],
                  "content":"Gambardella, Matthew"
               },
               {
                  "name":"title",
                  "attributes":{

                  },
                  "children":[

                  ],
                  "content":"XML Developer's Guide"
               }
            ],
            "content":""
         },
         {
            "name":"book",
            "attributes":{
               "id":"bk102"
            },
            "children":[
               {
                  "name":"author",
                  "attributes":{

                  },
                  "children":[

                  ],
                  "content":"Ralls, Kim"
               },
               {
                  "name":"title",
                  "attributes":{

                  },
                  "children":[

                  ],
                  "content":"Midnight Rain"
               }
            ],
            "content":""
         }
      ],
      "content":""
   }
}
```

## How to query

You'd be able to query your books like:

```graphql
{
  allBooks {
    edges {
      node {
        content
      }
    }
  }
}
```

Which would return:

```javascript
{
  allBooks: {
    edges: [
      {
        node: {
          content: 'Gambardella, Matthew'
        }
      },
      {
        node: {
          content: 'XML Developer's Guide
        }
      }
    ]
  }
}
```
