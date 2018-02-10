# gatsby-plugin-coffeescript

Provides drop-in support for CoffeeScript and CJSX.

## Install

`yarn add gatsby-plugin-coffeescript`

## How to use

1. Include the plugin in your `gatsby-config.js` file.
2. Write your components in CJSX or CoffeeScript.

```javascript
// in gatsby-config.js
plugins: [
  // no configuration
  `gatsby-plugin-coffeescript`,
  // custom configuration
  {
    resolve: `gatsby-plugin-coffeescript`,
    // options are passed directly to the compiler
    options: {},
  },
];
```

## Notes

First, note that CoffeeScript + React is a troubled combination. This plugin
relies upon deprecated modules that may someday prove to be dysfunctional or
otherwise deficient.

Furthermore, note that the installed version of CoffeeScript is @next. This is
not optional - _named exports are required for page queries to work properly._

You will need to manually edit your `coffee-loader` installation and install
`coffeescript` separately in your project directory to ensure that
CoffeeScript@next is being loaded. The very first line of source in the former's
`index.js` should be the following: note the lack of dash.

```js
var coffee = require("coffeescript");
```
