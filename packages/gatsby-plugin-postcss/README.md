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

## Options

You can use any allowed [`postcss-loader`](https://github.com/postcss/postcss-loader#options) options using `postcss` property:

`gatsby-config.js`

```js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-postcss`,
      options: {
        postcss: {
          plugins: () => [require(`postcss-preset-env`)({ stage: 0 })],
        },
      },
    },
  ],
}
```
