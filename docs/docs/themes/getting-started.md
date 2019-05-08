---
title: Getting Started
---

Scaffolding out a project that uses themes requires you to use a starter that's implemented with theming.

```sh
gatsby new my-blog https://github.com/gatsbyjs/gatsby-starter-blog-theme
```

When you use a starter that's built with a theme, you will see that you're initially presented with a lighter weight `gatsby-config.js`. The goal with most themes is to allow you to get up and running with something like a blog in seconds. Now you can focus on writing and gradually introduce changes and customizations only if you want to.

For example, a theme-based starter for a blog might do the following:

## 1. Install the Theme and Configure It

```js:title=gatsby-config.js
module.exports = {
  themes: [
    {
      resolve: "gatsby-theme-blog",
      options: {
        postsPerPage: 5,
      },
    },
  ],
}
```

## 2. Scaffold Out an Example Post

```md:title=src/posts/hello-world.md
---
title: Hello, world!
path: /hello-world
---

I'm an example post!
```

## 3. Scaffold Out the Home Page

```md:title=src/pages/index.md
# Home page!
```

## Updating a Theme

In order to update the theme to pull in the latest updates you can update the `gatsby-theme-blog` version in your `package.json`.
You can do this by running the install again: `npm install --save gatsby-theme-NAME`.
