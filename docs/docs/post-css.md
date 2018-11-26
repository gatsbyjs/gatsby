---
title: PostCSS
---

PostCSS transforms extended syntaxes and features into modern, browser-friendly CSS. This guide will show you how to get started with Gatsby and PostCSS.

### Installation and Configuration

This guide assumes that you have a Gatsby project set up. If you need to set up a project, head to the [**Quick Start guide**](https://www.gatsbyjs.org/docs), then come back.

1.  Install the Gatsby plugin [**gatsby-plugin-postcss**](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-postcss).

`npm install --save gatsby-plugin-postcss`

2.  Include the plugin in your `gatsby-config.js` file.

```javascript:title=gatsby-config.js
plugins: [`gatsby-plugin-postcss`],
```

3.  Write your stylesheets using PostCSS (.css files) and require or import them as normal.

If you need to pass options to PostCSS use the plugins options; see postcss-loader for all available options.

#### Syntax example

```css
@custom-media --med (width <= 50rem);

@media (--med) {
  a {
    &:hover {
      color: color-mod(black alpha(54%));
    }
  }
}
```

### With CSS Modules

Using CSS modules requires no additional configuration. Simply prepend `.module` to the extension. For example: `App.css -> App.module.css`. Any file with the module extension will use CSS modules.

### PostCSS plugins

If you would prefer to add additional postprocessing to your PostCSS output you can specify plugins in the plugin options:

```javascript:title=gatsby-config.js
plugins: [
  {
    resolve: `gatsby-plugin-postcss`,
    options: {
      postCssPlugins: [require(`postcss-preset-env`)({ stage: 0 })],
    },
  },
],
```

Alternatively, you can use `postcss.config.js` to specify your particular PostCSS configuration:

```javascript:title=postcss.config.js
const postcssPresetEnv = require(`postcss-preset-env`)

module.exports = () => ({
  plugins: [
    postcssPresetEnv({
      stage: 0,
    }),
  ],
})
```

### Other resources

- [Introduction to postcss](https://www.smashingmagazine.com/2015/12/introduction-to-postcss/)
