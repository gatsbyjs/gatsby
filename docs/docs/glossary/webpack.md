---
title: webpack
disableTableOfContents: true
---

Learn what webpack is, how it works, and how Gatsby uses it to accelerate website development.

## What is webpack?

[webpack](/docs/glossary#webpack) is a <q>static module bundler,</q> or software that collects chunks or modules of JavaScript and compiles them into one or more optimized bundles. webpack is one of the core software packages that underpins Gatsby.

webpack works by creating a _dependency graph_. In other words, webpack determines which modules depend on other modules to make your site work. A _module_ is a chunk of code that encapsulates some functionality. It may be as small as a single JavaScript function, or it may be an entire library such as [React](/docs/glossary#react).

webpack determines dependencies from the contents of `webpack.config.js`. `webpack.config.js` can contain one or more _entry points_, which tell webpack which file or files to use as the starting point (or points) for a dependency graph. See the following example.

```javascript
module.exports = {
  entry: "/scripts/index.js",
}
```

webpack processes JavaScript and JSON files by default, but you can add support for CSS and media files with additional software and configuration. For example, Gatsby ships with its own [`webpack.config.js`](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/src/utils/webpack.config.js) file that supports [global CSS files](/docs/how-to/styling/global-css/), [component-scoped CSS modules](/docs/how-to/styling/css-modules/), and [CSS-in-JS](/docs/how-to/styling/css-in-js/).

You can also use webpack to optimize how CSS and JavaScript are delivered to the browser. webpack supports a feature known as [_code splitting_](https://webpack.js.org/guides/code-splitting/). Code splitting allows you to divide your code across a few bundles that are loaded as needed or as requested. Gatsby is already configured to use this feature. You do not have to do any additional set up to reap the benefits.

If you want to add support for features such as [Sass/SCSS](/docs/how-to/styling/sass/), that Gatsby does not support out of the box, you can also [add a custom webpack configuration](/docs/how-to/custom-configuration/add-custom-webpack-config/), or use one of the [Gatsby plugins](/docs/plugins/) contributed by the community.

### Learn more about webpack

- [webpack](https://webpack.js.org/) official site
- [Custom Configuration](/docs/customization/) from the Gatsby Docs
