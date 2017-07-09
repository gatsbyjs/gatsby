# gatsby-plugin-stylus

Provides drop-in support for Stylus with or without CSS Modules

## Install

`yarn add gatsby-plugin-stylus`

## How to use

1. Include the plugin in your `gatsby-config.js` file.
2. Write your stylesheets in Stylus (`.styl` files) and require/import them

### Without CSS Modules

```javascript
// in gatsby-config.js
plugins: [
  `gatsby-plugin-stylus`
]
```

### With CSS Modules

```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: 'gatsby-plugin-stylus',
    options: {
      modules: true,
    },
  },
],
```
