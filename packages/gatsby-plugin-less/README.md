# gatsby-plugin-less

Provides drop-in support for Less stylesheets

## Install

`npm install --save less gatsby-plugin-less`

## How to use

1.  Include the plugin in your `gatsby-config.js` file.
2.  Write your stylesheets in Less and require or import them as normal.

```javascript
// in gatsby-config.js
plugins: [`gatsby-plugin-less`]
```

If you need to pass options to Less use the plugins options; see [less-loader](https://github.com/webpack-contrib/less-loader)
for all available options.

```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-less`,
    options: {
      strictMath: true,
    },
  },
]
```

If you need to override the default options passed into [`css-loader`](https://github.com/webpack-contrib/css-loader)

```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-less`,
    options: {
      cssLoaderOptions: {
        camelCase: false,
      },
    },
  },
]
```

If you need to provide [Less plugins](https://github.com/less/less-docs/blob/master/content/usage/plugins.md), normally you would provide a `plugins` in the Less options, but this option attribute is already used by Gatsby. It has been remapped to `lessPlugins`

```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-less`,
    options: {
      lessPlugins: [MyLessPlugin],
    },
  },
]
```

### With CSS Modules

Using CSS modules requires no additional configuration. Simply prepend `.module` to the extension. For example: `App.less` -> `App.module.less`.
Any file with the `module` extension will use CSS modules.

### PostCSS plugins

PostCSS is also included to handle some default optimizations like autoprefixing
and common cross-browser flexbox bugs. Normally you don't need to think about it, but if
you'd prefer to add additional postprocessing to your Less output you can sepecify plugins
in the plugin options

```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-less`,
    options: {
      postCssPlugins: [somePostCssPlugin()],
    },
  },
]
```

## Breaking changes history

<!-- Please keep the breaking changes list ordered with the newest change at the top -->

### v2.0.0

- `less` is moved to a peer dependency. Installing the package
  alongside `gatsby-plugin-less` is now required. Use `npm install --save less`

- support Gatsby v2 only

- `theme` option has been removed. You can pass configuration object to less-loader:

```diff
plugins: [
  {
    resolve: `gatsby-plugin-less`,
    options: {
-      theme: {
-        "text-color": `#fff`,
-      }
+      modifyVars: {
+        "text-color": `#fff`,
+      }
    },
  },
]
```

```diff
plugins: [
  {
    resolve: `gatsby-plugin-less`,
    options: {
-      theme: `./src/theme.js`,
+      modifyVars: require(`./src/theme.js`),
    },
  },
]
```
