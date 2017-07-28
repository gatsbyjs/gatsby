# gatsby-plugin-stylus

Provides drop-in support for Stylus with or without CSS Modules

## Install

`yarn add gatsby-plugin-stylus`

## How to use

1. Include the plugin in your `gatsby-config.js` file.
2. Write your stylesheets in Stylus (`.styl` files) and require/import them

### With CSS Modules

Using CSS modules requires no additional configuration. Simply prepend `.module` to the extension. For example: `App.styl` -> `App.module.styl`.
Any file with the `module` extension will use CSS modules.

### With Stylus plugins

This plugin has the same API as [stylus-loader](https://github.com/shama/stylus-loader#stylus-plugins), which means you can add stylus plugins with `use`:

```javascript
// in gatsby-config.js
const rupture = require('rupture');

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-plugin-stylus',
      options: {
        use: [rupture()],
      },
    },
  ],
};
```

### PostCSS plugins

PostCSS is also included to handle some default optimizations like autoprefixing a
and common cross-browser flexbox bugs. Normally you don't need to think about it, but if
you'd prefer to add additional postprocessing to your Stylus output you can sepecify plugins
in the plugin options


```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-stylus`,
    options: {
      postCssPlugins: [
        somePostCssPlugin()
      ]
    }
  }
]
```

