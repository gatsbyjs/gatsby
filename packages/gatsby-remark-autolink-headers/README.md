# gatsby-remark-autolink-headers

This is a sub-plugin for gatsby-transformer-remark.  As demoed below, add this plugin to options of `gatsby-transformer-remark`.

This plugin a hover link to headers in your markdown files when rendered (this is the same as the links GitHub adds to its rendered markdown headers).

## Install

`npm install --save gatsby-remark-autolink-headers`

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [`gatsby-remark-autolink-headers`],
      },
    },
  ],
}
```
