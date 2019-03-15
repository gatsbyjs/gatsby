---
title: Customizing a Theme
---

If you've installed a theme there are a few different ways to customize them.

## Adding Options

Often times a theme will have options that can be passed to customize things like layouts, titles, or even the path for blog posts. To find out what options are possible you will need to check out the theme's readme.

You can pass options to a theme in the same way you pass options to plugins:

```js:title=gatsby-config.js
module.exports = {
  __experimentalThemes: [
    {
      resolve: "gatsby-theme-name",
      options: {
        postsPath: "/writing",
        layout: "large-header",
        colors: {
          primary: "tomato",
        },
      },
    },
  ],
}
```

## Component Shadowing

Gatsby Themes allow you to customize any file in a theme's `src` directory by following a file naming convention. If you're using `gatsby-theme-tomato` which uses a `ProfileCard` component located at `src/components/ProfileCard.js` you can override the component by creating `src/gatsby-theme-tomato/components/profile-card.js`. If you want to see what props are passed you can do so by putting the props into a `pre` tag:

```js:title=src/gatsby-theme-tomato/components/profile-card.js
import React from "react"

export default props => <pre>{JSON.stringify(props, null, 2)}</pre>
```
