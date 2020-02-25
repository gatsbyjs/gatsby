---
title: Using Multiple Themes Together
---

In this tutorial, you'll learn how to use multiple Gatsby themes by creating a new site using `gatsby-theme-blog`, `gatsby-theme-notes` and `@pauliescanlon/gatsby-mdx-embed`.

## A mental model of Gatsby themes

If you have worked with Wordpress or a similar CMS you have likely used a 'theme' or a 'template' before. Often this is a singular theme which controls the appearance and function of your entire site. You can install new themes, but not multiple themes together.

Gatsby themes are different. They are like toy building blocks which can be connected together to form the final site. Just like lego blocks they can be big and stylish, but they can also be small and simple. In fact some Gatsby themes include other sub-themes linked together already.

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
    {
      resolve: `gatsby-theme-blog`,
      options: {
        // basePath defaults to `/`
        basePath: `/blog`,
      },
    },
    {
      resolve: `gatsby-theme-notes`,
      options: {
        // basePath defaults to `/`
        basePath: `/notes`,
      },
    },
    `@pauliescanlon/gatsby-mdx-embed`,
  ],
}
```

## Add some demo content

When you first ran `gatsby develop` a `content` folder was created in the root of your site. Try adding a post and a note
