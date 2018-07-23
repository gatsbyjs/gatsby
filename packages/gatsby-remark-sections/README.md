# gatsby-remark-sections

Wraps the top level content between headers in html5 section elements.

This is a sub-plugin for `gatsby-transformer-remark`. Add this plugin to the options of `gatsby-transformer-remark`.

## Install

`npm install --save gatsby-remark-sections`

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [`gatsby-remark-sections`],
      },
    },
  ],
}
```
