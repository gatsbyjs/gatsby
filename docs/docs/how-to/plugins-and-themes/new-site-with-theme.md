---
title: How to Start a New Site with a Theme
---

The quickest way to get started using a Gatsby theme is to use a starter that's configured to use the theme.

For example, `gatsby-starter-blog-theme` is a theme starter for the `gatsby-theme-blog` package.

A **regular Gatsby starter** creates a new Gatsby site that is preconfigured for a particular use case. The resulting site effectively forks off the starter — after it’s created, the site maintains no connection to the starter.

A **Gatsby theme starter** creates a new Gatsby site that installs and configures one or more Gatsby themes. When a starter installs a theme, it maintains the connection to that theme as a standalone npm package.

Installing the Gatsby blog theme starter is the same process as a regular Gatsby starter:

```shell
gatsby new my-blog https://github.com/gatsbyjs/gatsby-starter-blog-theme
```

## What does a theme starter do?

The starter for the official Gatsby blog theme does the following:

### 1. The starter installs the theme and configures it

When you use a starter that's built with a theme, you will often see that you're initially presented with a lighter weight `gatsby-config.js`. Themes start doing their magic when installed via the `plugins` array:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-theme-blog",
      options: {},
    },
  ],
  // Customize your site metadata:
  siteMetadata: {
    title: "My Blog Title",
    author: "My Name",
    description: "My site description...",
    siteUrl: "https://www.gatsbyjs.com/",
    social: [
      {
        name: "twitter",
        url: "https://twitter.com/gatsbyjs",
      },
      {
        name: "github",
        url: "https://github.com/gatsbyjs",
      },
    ],
  },
}
```

### 2. The starter scaffolds out example blog posts

```mdx:title=/content/posts/hello-world.mdx
---
title: Hello, world!
path: /hello-world
---

I'm an example post!
```

Once you've made some edits, run `gatsby develop` to start a development server and view your changes in a browser.

## Updating a theme

To pull in the latest updates of your theme you can update the `gatsby-theme-blog` version in your site's `package.json`.

You can do this by running the install of the theme package again: `npm install gatsby-theme-blog`.
