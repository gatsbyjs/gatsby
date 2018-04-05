# gatsby-transformer-excel

Parses Excel files into JSON arrays.

## Install

`npm install --save gatsby-transformer-excel`

> Note: You will also need to use the [`gatsby-source-filesystem`](https://www.gatsbyjs.org/packages/gatsby-source-filesystem/) plugin to
make it works. You will have to point the path of the directory of your excel
files.

`npm install --save gatsby-source-filesystem`

## How to use

If you put your Excel's files in `./src/data`:

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `data`,
      path: `${__dirname}/src/data/`,
    },
  },
  `gatsby-transformer-excel`,
  ];
```

You can see an example project on the official [Gatsby repository](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-excel).

## Parsing algorithm

The parsing is powered by the [SheetJS / js-xlsx](https://git.io/xlsx) library.
Each row of each worksheet is converted into a node whose keys are determined by
the first row and whose type is determined by the name of the worksheet.

So if your project has a `letters.xlsx` with two worksheets:

```
------ Sheet1 ------
/|    A    |   B   |
-+---------+-------+
1| letter  | value |
-+---------+-------+
2|    a    |   97  |
-+---------+-------+
3|    b    |   98  |

------ Sheet2 ------
/|    A    |   B   |
-+---------+-------+
1| letter  | value |
-+---------+-------+
2|    A    |   65  |
-+---------+-------+
3|    B    |   66  |
```

the following nodes would be created:

```javascript
[
  { letter: "a", value: 97, type: "LettersXlsxSheet1" },
  { letter: "b", value: 98, type: "LettersXlsxSheet1" },
  { letter: "A", value: 65, type: "LettersXlsxSheet2" },
  { letter: "B", value: 66, type: "LettersXlsxSheet2" },
];
```

## How to query

You'd be able to query your letters like:

```graphql
{
  allLettersXlsxSheet1 {
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
  allLettersXlsxSheet1: {
    edges: [
      {
        node: {
          letter: 'a'
          value: 97
        }
      },
      {
        node: {
          letter: 'b'
          value: 98
        }
      },
    ]
  }
}
```
