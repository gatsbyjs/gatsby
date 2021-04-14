# gatsby-transformer-pdf

Use [pdf2Json](https://github.com/modesty/pdf2json) to extract textual content of pdf files.

## Install

`npm install gatsby-transformer-pdf`

You also need to have gatsby-source-filesystem installed and configured so it points to your files.

## How to use

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
    `gatsby-transformer-pdf`,
  ],
}
```

Then you'll be able to query the textual content of your pdf files like:

```graphql
{
  allPdf {
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
  "data": {
    "allPdf": {
      "edges": [
        {
          "node": {
            "content": "1 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vel purus id tortor \r\neleifend vulputate. Integer interdum ultricies ligula, nec mattis lorem viverra ac. \r\n"
          }
        }
      ]
    }
  }
}
```
