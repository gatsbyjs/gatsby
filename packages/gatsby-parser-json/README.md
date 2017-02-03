# Gatsby Parser JSON

Parses files with a `json` extension. Currently in only handles
stringified arrays but the goal is to handle in a reasonable way many
styles of persisting JSON data.

The algorithm for arrays is to convert each item in the array into
nodes.

So if your project has a `letters.json` with `[{ value: 'a' }, { value:
'b' }, { value: 'c' }]` then the following three nodes would be created.

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
