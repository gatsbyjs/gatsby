# gatsby-remark-autolink-headers

This is a plugin for a plugin.  Note in the `How to use` section below that you're adding this to the configuration of the `gatsby-transformer-remark` plugin and not adding another plugin in the chain.  

When enabled this plugin takes the headers from your markdown files and adds the 🔗 on-hover in your rendered pages (much like GitHub does in markdown files like the readme).

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
