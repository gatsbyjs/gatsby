# gatsby-plugin-postcss-sass
Provides drop-in support for SASS/SCSS stylesheets chained with _postcss_ plugin support.

## Install
`yarn add gatsby-plugin-postcss-sass`

## How to use
1. Include the plugin in your `gatsby-config.js` file.
2. Write your stylesheets in SASS/SCSS (with your desired _postcss_ featureset) and require/import them

```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-postcss-sass`,
    options: {
      postCssPlugins: [
        somePostCssPlugin()
      ]
    }
  }
]
```
