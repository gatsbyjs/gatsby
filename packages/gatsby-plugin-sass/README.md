# gatsby-plugin-sass
Provides drop-in support for SASS/SCSS stylesheets

## Install
`yarn add gatsby-plugin-sass`

## How to use
1. Include the plugin in your `gatsby-config.js` file.
2. Write your stylesheets in SASS/SCSS and import them

```javascript
// in gatsby-config.js
plugins: [
  // no configuration
  `gatsby-plugin-sass`,
  // custom configuration
  {
    resolve: `gatsby-plugin-sass`,
    // options are passed directly to the compiler
    options: {}
  }
]
```
