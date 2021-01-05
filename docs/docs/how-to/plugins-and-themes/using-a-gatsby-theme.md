---
title: How to Use a Theme in an Existing Site
---

While you can [get started quickly with a Gatsby theme starter](/docs/how-to/plugins-and-themes/new-site-with-theme/), you can also install a Gatsby theme directly to an existing Gatsby site. Gatsby themes are plugins, so you can [install and use them like any other Gatsby plugin](/docs/how-to/plugins-and-themes/using-a-plugin-in-your-site/).

## Installing a Theme

Like any Gatsby plugin, Gatsby themes are Node.js packages, so you can install them like other published packages in Node using npm or [yarn, including local workspaces](#using-yarn-workspaces).

For example, `gatsby-theme-blog` is the official Gatsby theme for creating a blog.

To install it, run in the root of your site:

```shell
npm install gatsby-theme-blog
```

## Theme options

Depending on the theme, there may be theme options that can be configured via `gatsby-config.js`.

For example, `gatsby-theme-blog` can take a number of different options. All of them are documented in the [theme's README](/plugins/gatsby-theme-blog/) file.

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-theme-blog`,
      options: {
        /*
        - basePath defaults to `/`
        */
        basePath: `/blog`,
      },
    },
  ],
}
```

To learn how to further customize a theme, check out the docs on [Gatsby theme shadowing](/docs/how-to/plugins-and-themes/shadowing/).

## Published Themes

Public Gatsby themes are published on npm for anyone to use. You can also publish private themes for use by your organization. Examples of private theme package hosting include the [npm registry](https://docs.npmjs.com/about-private-packages) and [GitHub Package Registry](https://help.github.com/en/github/managing-packages-with-github-package-registry/about-github-package-registry).

## Using Yarn Workspaces

If you would like to work with unpublished themes, consider [setting up Yarn Workspaces for theme development](/blog/2019-05-22-setting-up-yarn-workspaces-for-theme-development/) and [using Yarn](/docs/reference/gatsby-cli/#how-to-change-your-default-package-manager-for-your-next-project) instead of npm.
