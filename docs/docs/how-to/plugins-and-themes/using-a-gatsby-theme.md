---
title: Using a Gatsby Theme
---

Gatsby themes let you decompose a site into logical units. Like component libraries, they are an abstraction that allows one team to own and release a package that is pulled into one, or several, separate websites. For example, a team could own a product page theme which is used on multiple e-commerce websites. Other teams might own a blog theme, homepage theme,or store theme, all as separate packages. Themes allow your Gatsby site architecture to match your team structure.

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

## Additional Reading

- [How Little Caesars uses themes for marketing and e-commerce site sections](/blog/2020-07-15-little-caesars-delivers-with-gatsby/#user-content-gatsby-themes-delivers-easy-updates)
- [How Apollo uses themes for distributed documentation](https://www.gatsbyjs.com/blog/2019-07-03-using-themes-for-distributed-docs/)
