# gatsby-plugin-sass
Provides drop-in support for SASS/SCSS stylesheets

## Install
`yarn add gatsby-plugin-sass`

## How to use
1. Include the plugin in your `gatsby-config.js` file.
2. Write your stylesheets in SASS/SCSS and require/import them

```javascript
// in gatsby-config.js
plugins: [
  `gatsby-plugin-sass`
]
```

## Options
SASS defaults to [5 digits of precision](https://github.com/sass/sass/issues/1122). If this is too low for you (e.g. [if you use Bootstrap](https://github.com/twbs/bootstrap-sass/blob/master/README.md#sass-number-precision)), you may configure it as follows:
```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-sass`,
    options: {
      precision: 8,
    }
  }
]
```
