---
title: Themes API Reference
---

## Configuration

Similarly to plugins, you can access options that are passed to your theme.
You can use this to allow make filesystem sourcing configurable, accepting different nav menu items, or change branding colors from the default.

```js:title=gatsby-config.js
module.exports = {
  __experimentalThemes: [
    {
      resolve: "gatsby-theme-name",
      options: {
        postsPath: "/blog",
        colors: {
          primary: "tomato",
        },
      },
    },
  ],
}
```

Then, in your theme's `gatsby-node.js` you can access them as the second argument:

```js:title=gatsby-node.js
exports.createPages = async ({ graphql, actions }, themeOptions) => {
  console.log(themeOptions)
}
```

## Component shadowing

## Design tokens convention

## Separating queries and presentational components
