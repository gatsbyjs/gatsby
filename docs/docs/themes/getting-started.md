---
title: Using a Gatsby theme
---

To get started using themes, you can use a starter that installs the official Gatsby blog theme.

A **regular Gatsby starter** creates a new Gatsby site that is preconfigured for a particular use case. The resulting site effectively forks off the starter — after it’s created, the site maintains no connection to the starter.

A **Gatsby theme starter** creates a new site that installs one or more Gatsby themes. When a starter installs a theme, it maintains the connection to that theme as a standalone npm package.

Installing the Gatsby blog theme starter is the same process as a regular Gatsby starter:

```shell
gatsby new my-blog https://github.com/gatsbyjs/gatsby-starter-blog-theme
```

## What does a theme starter do?

The starter for the official Gatsby blog theme does the following:

### 1. The starter installs the theme and configures it

When you use a starter that's built with a theme, you will see that you're initially presented with a lighter weight `gatsby-config.js`.

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-theme-blog`,
      options: {},
    },
  ],
  // Customize your site metadata:
  siteMetadata: {
    title: `My Blog Title`,
    author: `My Name`,
    description: `My site description...`,
    siteUrl: `https://www.gatsbyjs.org/`,
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

### 2. The starter scaffolds out example blog posts.

```md:title=/content/posts/hello-world.mdx
---
title: Hello, world!
path: /hello-world
---

I'm an example post!
```

## Updating a Theme

In order to update the theme to pull in the latest updates you can update the `gatsby-theme-blog` version in your site's `package.json`.

You can do this by running the install of the theme package again: `npm install --save gatsby-theme-blog`.
