# gatsby-plugin-styled-jsx

Provides drop-in support for [styled-jsx](https://github.com/zeit/styled-jsx).

## Install

`npm install --save styled-jsx gatsby-plugin-styled-jsx`

## How to use

Add the plugin to the plugins array in your `gatsby-config.js` and use `<style jsx>` tags in your component files.

```javascript
plugins: [`gatsby-plugin-styled-jsx`]
```

You can add styled-jsx [plugins](https://github.com/zeit/styled-jsx#css-preprocessing-via-plugins) with the `jsxPlugins` option

```js
plugins: [
  {
    resolve: `gatsby-plugin-styled-jsx`,
    options: {
      jsxPlugins: ["styled-jsx-plugin-postcss"],
    },
  },
]
```

[Configuration options for `styled-jsx`](https://github.com/zeit/styled-jsx#configuration-options) can also be specified:

```js
plugins: [
  {
    resolve: `gatsby-plugin-styled-jsx`,
    options: {
      optimizeForSpeed: true,
      sourceMaps: false,
      vendorPrefixes: true,
    },
  },
]
```
