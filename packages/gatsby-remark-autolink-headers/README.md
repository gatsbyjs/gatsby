# gatsby-remark-autolink-headers

Adds GitHub-style links to `MarkdownRemark` headers.

## Install

`npm install --save gatsby-remark-autolink-headers`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [`gatsby-remark-autolink-headers`],
    },
  },
];
```
