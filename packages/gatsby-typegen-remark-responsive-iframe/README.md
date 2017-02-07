# gatsby-typegen-remark-responsive-iframe

Wraps iframes (e.g. embedded YouTube videos) in markdown files in a
responsive elastic container so the iframes always span 100% of
the width of their container.

## Install

`npm install --save gatsby-typegen-remark-responsive-iframe`

## How to use

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-typegen-remark`,
    options: {
      plugins: [
        `gatsby-typegen-remark-iframe`,
      ]
    }
  }
]
```
