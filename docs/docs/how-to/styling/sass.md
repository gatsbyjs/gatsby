---
title: Using Sass in Gatsby
examples:
  - label: Using Sass
    href: "https://github.com/gatsbyjs/gatsby/tree/master/examples/using-sass"
---

[Sass](https://sass-lang.com) is an extension of CSS, adding nested rules, variables, mixins, selector inheritance, and more. In Gatsby, Sass code can be translated to well-formatted, standard CSS using a plugin.

Sass will compile `.sass` and `.scss` files to `.css` files for you, so you can write your stylesheets with more advanced features.

> **Note**: the difference between using a `.sass` or `.scss` file is the syntax that you write your styles in. All valid CSS is valid SCSS as well so it is the easiest to use and most popular. You can read more about the differences in the [Sass documentation](https://sass-lang.com/documentation/syntax).

## Installing and configuring Sass

This guide assumes that you have a Gatsby project set up. If you need to set up a project, head to the [**Quick Start guide**](/docs/quick-start/), then come back.

1. Install the Gatsby plugin [**gatsby-plugin-sass**](/plugins/gatsby-plugin-sass/) and `sass`, a required peer dependency as of v3.0.0.

```shell
npm install sass gatsby-plugin-sass
```

2. Include the plugin in your `gatsby-config.js` file.

```javascript:title=gatsby-config.js
plugins: [`gatsby-plugin-sass`],
```

> **Note**: You can configure [additional plugin options](/plugins/gatsby-plugin-sass/#other-options) like paths to include and options for `css-loader`.

3. Write your stylesheets as `.sass` or `.scss` files and require or import them as normal.

```css:title=styles.scss
$font-stack: Helvetica, sans-serif;
$primary-color: #333;

body {
  font: 100% $font-stack;
  color: $primary-color;
}
```

```css:title=styles.sass
$font-stack: Helvetica, sans-serif
$primary-color: #333

body
  font: 100% $font-stack
  color: $primary-color
```

```javascript
import "./styles.scss"
import "./styles.sass"
```

## Other resources

- [Introduction to Sass](https://designmodo.com/introduction-sass/)
- [Sass documentation](https://sass-lang.com/documentation)
