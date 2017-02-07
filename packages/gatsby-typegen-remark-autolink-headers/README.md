# gatsby-typegen-remark-autolink-headers

Adds Github-style links to `MarkdownRemark` headers.

## Install

`npm install --save gatsby-typegen-remark-autolink-headers`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-typegen-remark`,
    options: {
      plugins: [
        `gatsby-typegen-remark-autolink-headers`,
      ]
    }
  }
]
```
