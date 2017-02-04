# gatsby-parser-yaml

Parses YAML files. Currently it only handles YAML arrays but the
goal is to handle in a reasonable way many types of YAML data.

## Install

`npm install --save gatsby-parser-yaml`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  `gatsby-parser-yaml`,
]
```

## Parsing algorithm

The algorithm for YAML arrays is to convert each item in the array into
a node.

So if your project has a `letters.yaml` which looks like:

```yaml
- value: a
- value: b
- value: c
```

Then the following three nodes would be created.

```javascript
[
  {
    value: 'a',
    type: 'Letters',
  },
  {
    value: 'b',
    type: 'Letters',
  },
  {
    value: 'c',
    type: 'Letters',
  },
]
```

## How to query

You'd be able to query your letters like:

```graphql
{
  allLetters {
    edges {
      node {
        value
      }
    }
  }
}
```

Which would return:

```javascript
{
  allLetters: {
    edges: [
      {
        node: {
          value: 'a'
        }
      },
      {
        node: {
          value: 'b'
        }
      },
      {
        node: {
          value: 'c'
        }
      }
    ]
  }
}
```

