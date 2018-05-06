# gatsby-remark-autolink-headers

Adds GitHub-style hover links to headers in your markdown files when they're rendered.

This is a sub-plugin for `gatsby-transformer-remark`. As demoed below, add this plugin to the options of `gatsby-transformer-remark`.

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
};
```

## Options

* `offsetY`: Signed integer, vertical offset value in pixels, e.g.

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              offsetY: `100`,
            },
          }
        ],
      },
    },
  ],
};
```
