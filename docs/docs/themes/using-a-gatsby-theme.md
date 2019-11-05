---
title: Using a Gatsby Theme
---

While you can [get started quickly with a Gatsby theme starter](/docs/themes/getting-started/), you can also install a Gatsby theme directly to an existing Gatsby site. Gatsby themes are plugins, so you can [install and use them like any other Gatsby plugin](/docs/using-a-plugin-in-your-site/).

## Installing a Theme

Like any Gatsby plugin, Gatsby themes are Node.js packages, so you can install them like other published packages in Node using npm or [yarn, including local workspaces](#using-yarn-workspaces).

For example, `gatsby-theme-blog` is the official Gatsby theme for creating a blog.

To install it, in the root of you site, run

```js
npm install --save gatsby-theme-blog
```

## Theme Options

Depending on the theme, there may be theme options that can be configured via `gatsby-config.js`.

For example, `gatsby-theme-blog` can take in 4 potential options: `basePath`, `contentPath`, `assetPath`, and `mdx`.

```js
// gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-theme-blog`,
      options: {
        /*
        - basePath defaults to `/`
        - contentPath defaults to `content/posts`
        - assetPath defaults to `content/assets`
        - mdx defaults to `true`
        */
        basePath: `/blog`,
        contentPath: `content/blogPosts`,
        assetPath: `content/blogAssets`,
        mdx: false,
      },
    },
  ],
}
```

To further customize a theme, see [Gatsby theme shadowing](/docs/themes/shadowing/).

## Published Themes

Public Gatsby themes are published on npm for anyone to use. You can also publish private themes for use by your organization. Examples of private npm package hosting include [npm registry](https://docs.npmjs.com/about-private-packages) and [GitHub Package Registry](https://help.github.com/en/github/managing-packages-with-github-package-registry/about-github-package-registry).

## Using Yarn Workspaces

If you would like to work with unpublished themes, consider [setting up Yarn Workspaces for theme development](/blog/2019-05-22-setting-up-yarn-workspaces-for-theme-development/#reach-skip-nav).
