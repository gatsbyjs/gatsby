# gatsby-transformer-csv

Parses CSV files into JSON arrays.

## Install

`npm install --save gatsby-transformer-csv`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  `gatsby-transformer-csv`,
]
```
Above is the minimal configuration required to begin working. Additional customization
of the parsing process is possible using the parameters listed in
[csvtojson](https://github.com/Keyang/node-csvtojson#parameters).

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-csv`,
    options: {
      noheader: true
    }
  }
]
```

## Parsing algorithm

Each row is converted into a node with CSV headers as the keys.

So if your project has a `letters.csv` with
```
letter,value
a,65
b,66
c,67
```
the following three nodes would be created.

```javascript
[
  { letter: 'a', value: 65, type: 'LettersCsv' },
  { letter: 'b', value: 66, type: 'LettersCsv' },
  { letter: 'c', value: 67, type: 'LettersCsv' },
]
```

## How to query

You'd be able to query your letters like:

```graphql
{
  allLettersCsv {
    edges {
      node {
        letter
        value
      }
    }
  }
}
```

Which would return:

```javascript
{
  allLettersCsv: {
    edges: [
      {
        node: {
          letter: 'a'
          value: 65
        }
      },
      {
        node: {
          letter: 'b'
          value: 66
        }
      },
      {
        node: {
          letter: 'c'
          value: 67
        }
      }
    ]
  }
}
```

