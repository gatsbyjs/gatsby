---
title: Browser Support
---

Gatsby supports [the same browsers as the current stable version of React.js](https://reactjs.org/docs/javascript-environment-requirements.html) which is currently Edge, Firefox, Chrome, Safari, as well as the most recent versions of other popular browsers.

## Polyfills

Gatsby leverages Babel's ability to automatically add polyfills for your target browsers.

Newer browsers support more JavaScript APIs than older browsers. For older versions, Gatsby (via Babel) automatically adds the minimum "polyfills" necessary for your code to work in those browsers.

If you start using a newer JavaScript API like `[].includes` that isn't supported by some of your targeted browsers, you won't have to worry about it breaking the older browsers as Babel will automatically add the needed polyfill `core-js/modules/es7.array.includes`.

## Specify what browsers your project supports using "Browserslist"

You may customize your list of supported browser versions by declaring a [`"browserslist"`](https://github.com/ai/browserslist) key within your `package.json`. Changing these values will modify your JavaScript (via [`babel-preset-env`](https://github.com/babel/babel-preset-env#targetsbrowsers)) and your CSS (via [`autoprefixer`](https://github.com/postcss/autoprefixer)) output.

The article [Browserslist is a Good Idea](https://css-tricks.com/browserlist-good-idea/) is a good introduction to the growing community of tools around Browserslist.

By default, Gatsby emulates the following config:

```json:title=package.json
{
  "browserslist": [">0.25%", "not dead and supports es6-module"]
}
```

If you only support newer browsers, make sure to specify this in your `package.json`. This will often enable you to ship smaller JavaScript files.
