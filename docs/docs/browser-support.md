---
title: Browser Support
---

Gatsby supports [the same browsers as the current stable version of React.js](https://facebook.github.io/react/docs/react-dom.html#browser-support) which is currently IE9+ as well as the most recent versions of other popular browsers.

## Polyfills

Gatsby uses the ES6 Promise API. As some older browsers don't support this, Gatsby includes by default a Promise polyfill. If you would like to provide your own Promise polyfill, you can set `polyfill` to `false` in your `gatsby-config.js`:

```
module.exports = {
  polyfill: false,
  // ...
}
```

## Specify what browsers your project supports using "Browserslist"

You may customize your list of supported browser versions by declaring a [`"browserslist"`](https://github.com/ai/browserslist) key within your `package.json`. Changing these values will modify your JavaScript (via [`babel-preset-env`](https://github.com/babel/babel-preset-env#targetsbrowsers)) and your CSS (via [`autoprefixer`](https://github.com/postcss/autoprefixer)) output.

This article is a good introduction to the growing community of tools around Browserslist — https://css-tricks.com/browserlist-good-idea/

By default, Gatsby emulates the following config:

 ```javascript
// package.json
{
  "browserslist": [
    "> 1%",
    "IE >= 9",
    "last 2 versions"
  ]
}
```
