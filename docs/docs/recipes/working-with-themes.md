---
title: "Recipes: Working with Themes"
---

A [Gatsby theme](/docs/themes/what-are-gatsby-themes) abstracts Gatsby configuration (shared functionality, data sourcing, design) into an installable package. This means that the configuration and functionality isn’t directly written into your project, but rather versioned, centrally managed, and installed as a dependency. You can seamlessly update a theme, compose themes together, and even swap out one compatible theme for another.

## Creating a new site using a theme starter

Creating a site based on a starter that configures a theme follows the same process as creating a site based on a starter that **doesn't** configure a theme. In this example you can use the [starter for creating a new site that uses the official Gatsby blog theme](https://github.com/gatsbyjs/gatsby-starter-blog-theme).

### Prerequisites

- The [Gatsby CLI](/docs/gatsby-cli) installed

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

- Learn how to use an existing Gatsby theme in the [shorter conceptual guide](/docs/themes/using-a-gatsby-theme) or the more detailed [step-by-step tutorial](/tutorial/using-a-theme).

## Building a new theme

<EggheadEmbed
  lessonLink="https://egghead.io/lessons/gatsby-use-the-gatsby-theme-workspace-starter-to-begin-building-a-new-theme"
  lessonTitle="Use the Gatsby Theme Workspace Starter to Begin Building a New Theme"
/>

### Prerequisites

- The [Gatsby CLI](/docs/gatsby-cli) installed
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

- Follow a [more detailed guide](/docs/themes/building-themes/) on using the Gatsby theme workspace starter.
- Learn how to build your own theme in the [Gatsby Theme Authoring video course on Egghead](https://egghead.io/courses/gatsby-theme-authoring), or in the [video course's complementary written tutorial companion](/tutorial/building-a-theme).
