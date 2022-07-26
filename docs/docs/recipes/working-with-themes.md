---
title: "Recipes: Working with Themes"
tableOfContentsDepth: 1
---

A [Gatsby theme](/docs/themes/what-are-gatsby-themes) abstracts Gatsby configuration (shared functionality, data sourcing, design) into an installable package. This means that the configuration and functionality isn’t directly written into your project, but rather versioned, centrally managed, and installed as a dependency. You can seamlessly update a theme, compose themes together, and even swap out one compatible theme for another.

## Creating a new site using a theme

Found a theme you'd like to use on your project? Awesome! You can configure it for use by following the steps below.

> If you'd like to take a look at more theme options, check out this [list of themes](/plugins?=gatsby-theme).

### Prerequisites

- Make sure you have the [Gatsby CLI](/docs/reference/gatsby-cli) installed

### Directions

1. Create a gatsby site

```shell
gatsby new {your-project-name}
```

2. Change directory and install theme

In this example, our theme is `gatsby-theme-blog`. You can replace that reference with whatever your theme is named.

```shell
cd {your-project-name}
npm install gatsby-theme-blog
```

3. Add theme to `gatsby-config.js`

Follow the instructions found in the README of the theme you're using to determine what configuration it requires.

> To learn how to further customize the blog theme, check out the available configuration options in the [Gatsby-theme-blog Documentation](/plugins/gatsby-theme-blog/#theme-options).

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

4. Run `gatsby develop`, the theme should now be running on your site. In this case with the blog theme configured with the `basePath` to `"/blog"`, it should be available at `http://localhost:8000/blog`.

### Additional resources

- To learn how to further customize a theme, check out the docs on [Gatsby theme shadowing.](/docs/how-to/plugins-and-themes/shadowing/)

- You can also [use multiple themes](/docs/themes/using-multiple-gatsby-themes/) on a project.

## Creating a new site using a theme starter

Creating a site based on a starter that configures a theme follows the same process as creating a site based on a starter that **doesn't** configure a theme. In this example you can use the [starter for creating a new site that uses the official Gatsby blog theme](https://github.com/gatsbyjs/gatsby-starter-blog-theme).

### Prerequisites

- Make sure you have the [Gatsby CLI](/docs/reference/gatsby-cli) installed

### Directions

1. Generate a new site based on the blog theme starter:

```shell
gatsby new {your-project-name} https://github.com/gatsbyjs/gatsby-starter-blog-theme
```

2. Run your new site:

```shell
cd {your-project-name}
gatsby develop
```

### Additional resources

- Learn how to use an existing Gatsby theme in the [shorter conceptual guide](/docs/how-to/plugins-and-themes/using-a-gatsby-theme) or the more detailed [step-by-step tutorial](/tutorial/using-a-theme).

## Building a new theme

<EggheadEmbed
  lessonLink="https://egghead.io/lessons/gatsby-use-the-gatsby-theme-workspace-starter-to-begin-building-a-new-theme"
  lessonTitle="Use the Gatsby Theme Workspace Starter to Begin Building a New Theme"
/>

### Prerequisites

- The [Gatsby CLI](/docs/reference/gatsby-cli) installed
- [Yarn](https://yarnpkg.com/lang/en/docs/install/#mac-stable) installed

### Directions

1. Generate a new theme workspace using the [Gatsby theme workspace starter](https://github.com/gatsbyjs/gatsby-starter-theme-workspace):

```shell
gatsby new {your-project-name} https://github.com/gatsbyjs/gatsby-starter-theme-workspace
```

2. Run the example site in the workspace:

```shell
yarn workspace example develop
```

### Additional resources

- Follow a [more detailed guide](/docs/how-to/plugins-and-themes/building-themes/) on using the Gatsby theme workspace starter.
- Learn how to build your own theme in the [Gatsby Theme Authoring video course on Egghead](https://egghead.io/courses/gatsby-theme-authoring), or in the [video course's complementary written tutorial companion](/tutorial/building-a-theme).
