# gatsby-plugin-sass

Provides drop-in support for SASS/SCSS stylesheets

## Install

`npm install --save node-sass gatsby-plugin-sass`

## How to use

1. Include the plugin in your `gatsby-config.js` file.
2. Write your stylesheets in SASS/SCSS and require or import them as normal.

```javascript
// in gatsby-config.js
plugins: [`gatsby-plugin-sass`]
```

By Default `node-sass` is used. To use `dart-sass`.

```bash
npm i -D sass
```

```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-sass`,
    options: {
      implementation: require("sass"),
    },
  },
]
```

If you need to pass options to Sass use the plugins options, see [node-sass](https://github.com/sass/node-sass)/[dart-sass](https://github.com/sass/dart-sass) docs
for all available options.

```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-sass`,
    options: {
      includePaths: ["absolute/path/a", "absolute/path/b"],
      ...
    },
  },
]
```

If you need to override the default options passed into [`css-loader`](https://github.com/webpack-contrib/css-loader):

```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-sass`,
    options: {
      cssLoaderOptions: {
        camelCase: false,
      },
    },
  },
]
```

### With CSS Modules

Using CSS Modules requires no additional configuration. Simply prepend `.module` to the extension. For example: `App.scss` -> `App.module.scss`.
Any file with the `module` extension will use CSS Modules.

### PostCSS plugins

PostCSS is also included to handle some default optimizations like autoprefixing
and common cross-browser flexbox bugs. Normally you don't need to think about it, but if
you'd prefer to add additional postprocessing to your SASS output you can specify plugins
in the plugin options

## Relative paths & url()

This plugin resolves `url()` paths relative to the entry SCSS/SASS file not – as might be expected – the location relative to the declaration. Under the hood, it makes use of [sass-loader](https://github.com/webpack-contrib/sass-loader/blob/master/README.md#problems-with-url) and this is documented in the [readme](https://github.com/webpack-contrib/sass-loader/blob/master/README.md#problems-with-url).

Using [resolve-url-loader](https://github.com/bholloway/resolve-url-loader) may provide a workaround, but at present this is not in the build and implementation would demand customisation.

TODO link to a plugin that adds resolve-url-loader

## Other options

SASS defaults to [5 digits of precision](https://github.com/sass/sass/issues/1122). If this is too low for you (e.g. [if you use Bootstrap](https://github.com/twbs/bootstrap-sass/blob/master/README.md#sass-number-precision)), you may configure it as follows:

```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-sass`,
    options: {
      postCssPlugins: [somePostCssPlugin()],
      precision: 8,
    },
  },
]
```

## Breaking changes history

<!-- Please keep the breaking changes list ordered with the newest change at the top -->

### v2.0.0

- `node-sass` is moved to a peer dependency. Installing the package
  alongside `gatsby-plugin-sass` is now required. Use `npm install --save node-sass`

- support Gatsby v2 only
