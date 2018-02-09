# gatsby-plugin-lodash

Adds the Lodash webpack & Babel plugins for easy modular, small Lodash builds.

## Install

`npm install --save gatsby-plugin-lodash lodash`

## How to use

Add the plugin to your `gatsby-config.js`.

```javascript
plugins: [`gatsby-plugin-lodash`];
```

By default this plugin enables all
[feature sets](https://github.com/lodash/lodash-webpack-plugin#feature-sets). If
you know you don't need some of them, you can remove support for features sets
by setting a `disabledFeatures` option like the following:

```javascript
plugins: [
  {
    resolve: `gatsby-plugin-lodash`,
    options: {
      disabledFeatures: [`shorthands`, `cloning`],
    },
  },
];
```
