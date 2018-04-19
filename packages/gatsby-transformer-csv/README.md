# gatsby-transformer-csv

Parses CSV files into JSON arrays.

## Install

`npm install --save gatsby-transformer-csv`

Note: You generally will use this plugin together with the [`gatsby-source-filesystem`](/packages/gatsby-source-filesystem/) plugin. `gatsby-source-filesystem` reads in the files then this plugin _transforms_ the files into data you can query.

## How to use

If you put your csv's files in `./src/data`:

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/src/data/`,
      },
    },
    `gatsby-transformer-csv`,
  ],
};
```

Above is the minimal configuration required to begin working. Additional
customization of the parsing process is possible using the parameters listed in
[csvtojson](https://github.com/Keyang/node-csvtojson#parameters).

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/src/data/`,
      },
    },
    {
      resolve: `gatsby-transformer-csv`,
      options: {
        noheader: true,
      },
    },
  ];
}
```

You can see an example project at https://github.com/gatsbyjs/gatsby/tree/master/examples/using-csv.

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
  { letter: "a", value: 65, type: "LettersCsv" },
  { letter: "b", value: 66, type: "LettersCsv" },
  { letter: "c", value: 67, type: "LettersCsv" },
];
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
