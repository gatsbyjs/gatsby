---
title: Browser Support
---

By default, Gatsby supports [the same browsers as the current stable version of React.js](https://facebook.github.io/react/docs/react-dom.html#browser-support) which is currently IE9+ as well as the most recent versions of other popular browsers.  Gatsby includes some features to ensure this level of support while also allowing you to use the latest and greatest ECMAScript APIs.

## ES6 Promises

Gatsby makes use of the [Promise API](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) so that plugins can run asynchronous code early on during bootstrap.

Because of this, Gatsby by default includes a Promise polyfill when building your site.  If you would like to provide your own promise implementation, you can set `polyfill` to `false` in your `gatsby-config.js`:

```
module.exports = {
    polyfill: false,
    // ...
}
```

## Browserslist

You may customize your list of supported browser versions by declaring a [`"browserslist"`](https://github.com/ai/browserslist) key within your `package.json`. Changing these values will modify your JavaScript (via [`babel-preset-env`](https://github.com/babel/babel-preset-env#targetsbrowsers)) and your CSS (via [`autoprefixer`](https://github.com/postcss/autoprefixer)) output.

This article is a good introduction to the growing community around Browserslist — https://css-tricks.com/browserlist-good-idea/

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
