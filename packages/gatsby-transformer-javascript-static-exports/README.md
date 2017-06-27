# gatsby-transformer-js

Parses js files.

## Install

`npm install --save gatsby-transformer-js`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  `gatsby-transformer-js`,
]
```

## Parsing algorithm

The algorithm for uses babylon and traverse (from the babel family of code) to statically read the data exports.

In a .js|.jsx file, export a data object to set your metadata variables, like so:
```javascript
import React from 'react'

exports.data = {
  title: 'This is a title',
}

export default MyComponent ...
```

You can also use a named export for the data object:

```javascript
export const data = {
  title: 'This is a title',
}
```

## How to query

You'd be able to query your letters like:

```graphql
{
  allJsFrontmatter {
    edges {
      node {
        exportsData {
          JSFrontmatter
          data {
            path
            title
            written
            category
            description
            updated
          }
        }
      }
    }
  }
}
```

Which would return something like:

```javascript
{
  "data": {
    "allJsFrontmatter": {
      "edges": [
        {
          "node": {
            "exportsData": {
              "JSFrontmatter": "filled",
              "data": {
                "path": "choropleth-on-d3v4",
                "title": "Choropleth on d3v4",
                "written": "2017-03-09",
                "category": "data science",
                "description": "Things about the choropleth.",
                "updated": null
              }
            }
          }
        }
      ]
    }
  }
}
```

The FrontMatterJS will contain "filled" or "error" just to give a surface level view of what the query is pulling out. Any attribute on "data" across your js files will be exported. If a file is missing it, the value will be null.
