# gatsby-plugin-sass
Provides drop-in support for SASS/SCSS stylesheets

## Install
`yarn add gatsby-plugin-sass`

## How to use
1. Include the plugin in your `gatsby-config.js` file.
2. Write your stylesheets in SASS/SCSS and require or import them as normal.

```javascript
// in gatsby-config.js
plugins: [
  `gatsby-plugin-sass`
]
```

If you need to pass options to Sass use the plugins options, see [node-sass](https://github.com/sass/node-sass)
for all available options.

```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-sass`,
    options: {
      includePaths: ["absolute/path/a", "absolute/path/b"]
    }
  }
]
```

### With CSS Modules

Using CSS modules requires no additional configuration. Simply prepend `.module` to the extension. For example: `App.scss` -> `App.module.scss`.
Any file with the `module` extension will use CSS modules.

### PostCSS plugins

PostCSS is also included to handle some default optimizations like autoprefixing a
and common cross-browser flexbox bugs. Normally you don't need to think about it, but if
you'd prefer to add additional postprocessing to your SASS output you can sepecify plugins
in the plugin options


```javascript
// in gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-sass`,
    options: {
      postCssPlugins: [
        somePostCssPlugin()
      ]
    }
  }
]
```

