# gatsby-plugin-postcss

Gatsby plugin to handle PostCSS.

## Install

`npm install postcss gatsby-plugin-postcss`

## How to use

1.  Include the plugin in your `gatsby-config.js` file.
2.  Write your stylesheets using PostCSS (`.css` files) and require or import them as normal.

```javascript
// in gatsby-config.js
plugins: [`gatsby-plugin-postcss`],
```

If you need to pass options to PostCSS use the plugins options; see [postcss-loader](https://github.com/postcss/postcss-loader) for all available options.

### With CSS Modules

Using CSS modules requires no additional configuration. Simply prepend `.module` to the extension. For example: `App.css` -> `App.module.css`.
Any file with the `module` extension will use CSS modules.

### PostCSS plugins

If you would prefer to add additional postprocessing to your PostCSS output you can specify plugins in the plugin options:

```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-postcss`,
    options: {
      postCssPlugins: [require(`postcss-preset-env`)({ stage: 0 })],
    },
  },
],
```

Alternatively, you can use `postcss.config.js` to specify your particular PostCSS configuration:

```javascript
// in postcss.config.js
const postcssPresetEnv = require(`postcss-preset-env`)

module.exports = () => ({
  plugins: [
    postcssPresetEnv({
      stage: 0,
    }),
  ],
})
```

If you need to override the default options passed into [`css-loader`](https://github.com/webpack-contrib/css-loader/tree/version-1)
**Note:** Gatsby is using `css-loader@1.0.1`.

```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-postcss`,
    options: {
      cssLoaderOptions: {
        camelCase: false,
      },
    },
  },
]
```
