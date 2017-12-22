# gatsby-remark-custom-blocks

Adds custom blocks to `MarkdownRemark` using [remark-custom-blocks](https://github.com/zestedesavoir/zmarkdown/tree/master/packages/remark-custom-blocks).

## Install

`npm install --save gatsby-remark-custom-blocks`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: "gatsby-remark-custom-blocks",
          options: {
            blocks: {
              danger: "custom-block-danger",
              info: "custom-block-info",
            },
          },
        },
      ],
    },
  },
];
```
