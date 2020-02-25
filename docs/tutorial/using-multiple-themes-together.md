---
title: Using Multiple Themes Together
---

In this tutorial, you'll learn how to use multiple Gatsby themes by creating a new site using `gatsby-theme-blog`, `gatsby-theme-notes` and `@pauliescanlon/gatsby-mdx-embed`.

## Create a new site using the hello world starter

```shell
gatsby new multiple-themes https://github.com/gatsbyjs/gatsby-starter-hello-world
```

## Install the themes

```shell
yarn add gatsby-theme-blog gatsby-theme-notes @pauliescanlon/gatsby-mdx-embed
```

## Update gatsby-config.js

The themes need to be added to the plugins array and let's add some basic metadata while we are at it.

```javascript:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `Multiple Themes`,
    description: `A tutorial for building a Gatsby site using multiple themes`,
  },
  plugins: [
    `gatsby-theme-blog`,
    `gatsby-theme-notes`,
    `@pauliescanlon/gatsby-mdx-embed`,
  ],
}
```

## Remove index.js

Remove `src/pages/index.js`. The themes will compose together and provide a pre-built index page for your website by default.

## Add some demo content
