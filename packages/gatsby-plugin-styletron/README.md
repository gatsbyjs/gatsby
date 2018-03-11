# gatsby-plugin-styletron

A [Gatsby](https://github.com/gatsbyjs/gatsby) plugin for
[styletron](https://github.com/rtsao/styletron) with built-in server-side
rendering support.

## Install

`npm install --dev gatsby-plugin-styletron`

## How to use

Edit `gatsby-config.js`

```javascript
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-styletron",
      options: {
        // You can pass options to Styletron.
        prefix: "_",
      },
    },
  ],
};
```
