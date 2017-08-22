# gatsby-plugin-less
Provides drop-in support for Less stylesheets

## Install
`yarn add gatsby-plugin-less`

## How to use
1. Include the plugin in your `gatsby-config.js` file.
2. Write your stylesheets in Less and require or import them as normal.

```javascript
// in gatsby-config.js
plugins: [
  `gatsby-plugin-less`
]
```

If you need to pass options to Less use the plugins options; see [less-loader](https://github.com/webpack-contrib/less-loader)
for all available options.

```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-less`,
    options: {
      strictMath: true,
    }
  }
]
```

### With CSS Modules

Using CSS modules requires no additional configuration. Simply prepend `.module` to the extension. For example: `App.less` -> `App.module.less`.
Any file with the `module` extension will use CSS modules.

### PostCSS plugins

PostCSS is also included to handle some default optimizations like autoprefixing a
and common cross-browser flexbox bugs. Normally you don't need to think about it, but if
you'd prefer to add additional postprocessing to your Less output you can sepecify plugins
in the plugin options


```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-less`,
    options: {
      postCssPlugins: [
        somePostCssPlugin()
      ]
    }
  }
]
```

