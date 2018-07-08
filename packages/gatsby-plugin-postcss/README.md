# gatsby-plugin-postcss

Gatsby plugin to handle PostCSS.

## Install

`npm install --save gatsby-plugin-postcss`

## How to use

1.  Include the plugin in your `gatsby-config.js` file:

`gatsby-config.js`

```js
module.exports = {
  plugins: ["gatsby-plugin-postcss"],
}
```

If you need to pass options to PostCSS use the plugins options; see [postcss-loader](https://github.com/postcss/postcss-loader)
for all available options.

2.  Create your own `postcss.config.js`:

`postcss.config.js`

```js
const postcssPresetEnv = require(`postcss-preset-env`)

module.exports = () => ({
  plugins: [
    postcssPresetEnv({
      stage: 0,
    }),
  ],
})
```

### With CSS Modules

Using CSS modules requires no additional configuration. Simply prepend `.module` to the extension. For example: `App.css` -> `App.module.css`.
Any file with the `module` extension will use CSS modules.

### PostCSS plugins

PostCSS is also included to handle some default optimizations like autoprefixing a
and common cross-browser flexbox bugs. Normally you don't need to think about it, but if
you'd prefer to add additional postprocessing to your PostCSS output you can sepecify plugins
in the plugin options

`gatsby-config.js`

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-postcss`,
      options: {
        postCssPlugins: [require(`postcss-preset-env`)({ stage: 0 })],
      },
    },
  ],
}
```
