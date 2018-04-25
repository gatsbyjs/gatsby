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

### Illegal Characters in GraphQL

Because GraphQL field names can only use alphanumeric characters and underscores gatsby-transformer-csv will replace any characters in headers not matching `/[_A-za-z0-9]/` with an underscore.  If you have spacing or punctuation you want to preserve in your headers use the `{noheaders: true}` option, and handle your headers as data in your own code.  For example, if you have a CSV file such as:

```
"Type of Ice Cream", "Is it good?"
"Vanilla", "Yes"
"Chocolate", "No"
```

the following three nodes will be created with the default options:

```javascript
[
  { Type_of_Ice_Cream: "Vanilla", Is_it_good_: "Yes" },
  { Type_of_Ice_Cream: "Chocolate", Is_it_good_: "No" },
];
```

and with `{noheaders: true}` you will get:

```javascript
[
  { field1: "Type of Ice Cream", field2: "Is it good?" },
  { field1: "Vanilla", field2: "Yes" },
  { field1: "Chocolate", field2: "No" },
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
