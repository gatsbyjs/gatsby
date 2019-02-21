---
title: Themes API Reference
---

Themes are packaged Gatsby sites, so you have access to all of Gatsby's APIs.

- [Gatsby Config](https://www.gatsbyjs.org/docs/gatsby-config/)
- [Actions](https://www.gatsbyjs.org/docs/actions/)
- [Node Interface](https://www.gatsbyjs.org/docs/node-interface/)
- ... [and more](https://www.gatsbyjs.org/docs/api-specification/)

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

## Component Shadowing

Gatsby Themes allow you to customize any file in a theme's `src` directory by following a file naming convention.
If you're using `gatsby-theme-tomato` which uses a `ProfileCard` component located at `src/components/ProfileCard.js` you can override the component by creating `src/gatsby-theme-tomato/components/ProfileCard.js`. If you want to see what props are passed you can do so by putting the props into a `pre` tag:

```js:title=src/gatsby-theme-tomato/components/ProfileCard.js
import React from "react"

export default props => <pre>{JSON.stringify(props, null, 2)}</pre>
```

## Add theme transpilation

**Note**: This is only needed temporarily. Themes will automatically be transpiled in later versions.

Since your theme will be installed, it will end up in `node_modules` which Gatsby doesn't transpile by default.
This is something you can achieve with `gatsby-plugin-compile-es6-packages`.

You will need to install the package:

```sh
yarn add gatsby-plugin-compile-es6-packages
```

And then add it to your plugins list:

```js:title=gatsby-config.js
const path = require("path")

module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-page-creator",
      options: {
        path: path.join(__dirname, "src", "pages"),
      },
    },
    {
      resolve: "gatsby-plugin-compile-es6-packages",
      options: {
        modules: ["gatsby-theme-developer"],
      },
    },
  ],
}
```

## Design Token Conventions

## Separating Queries and Presentational Components
