---
title: Browserslist
---

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
