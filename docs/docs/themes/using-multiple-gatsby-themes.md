---
title: Using Multiple Gatsby Themes
---

Gatsby themes are intended to be composable. This means you can install multiple themes alongside each other.

For example, `gatsby-starter-theme` composes two Gatsby themes: `gatsby-theme-blog` and `gatsby-theme-notes`

```shell
gatsby new my-notes-blog https://github.com/gatsbyjs/gatsby-starter-theme
```

You can include multiple theme packages in your `gatsby-config.js`. `gatsby-starter-theme` includes both theme packages: `gatsby-theme-blog` and `gatsby-theme-notes`.

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-theme-notes`,
      options: {
        mdx: true,
        basePath: `/notes`,
      },
    },
    // with gatsby-plugin-theme-ui, the last theme in the config
    // will override the theme-ui context from other themes
    { resolve: `gatsby-theme-blog` },
  ],
  siteMetadata: {
    title: `Shadowed Site Title`,
  },
}
```

In the default setup, a blog will be served from the root path (`/`), and the notes content will be served from `/notes`.

Run `gatsby develop` to start a development server and view your site.

## Tutorial

For a step-by-step tutorial, see the ["Using Multiple Themes Together" tutorial](/tutorial/using-multiple-themes-together).
