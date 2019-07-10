---
title: Building a Theme
---

In this tutorial, you'll learn how to build a theme plugin for Gatsby. This tutorial is meant as a written companion to the [Gatsby Theme Authoring Egghead course](https://egghead.io/courses/gatsby-theme-authoring).

## Overview

## Set up yarn workspaces

In this section, you'll learn how to structure folders and configure Yarn workspaces to develop Gatsby themes. You'll create two workspaces, `gatsby-theme-events` and `site`.

You'll see how each workspace can be run separately, as well as one depending on the other. In this example, `gatsby-theme-events` will be a dependency of `site`.

### Create a new empty folder

Title it anything you wish. Through this example, we'll call it `authoring-themes-tutorial`.

### Add a `package.json`

Create a `package.json` file in the new directory, with the following contents:

```json:title=package.json
{
  "private": true,
  "workspaces": ["gatsby-theme-events", "site"]
}
```

### Set up `gatsby-theme-events` and `site`

In the `authoring-themes-tutorial` folder, create two new folders, `gatsby-theme-events`, and `site`.

Create a `package.json` file in each of the new folders. Your file tree will look like this:

```
.
├── gatsby-theme-events
│   └── package.json
├── site
│   └── package.json
└── package.json
```

In the `package.json` file in `gatsby-theme-events`, add the following:

```json:title=gatsby-theme-events/package.json
{
  "name": "gatsby-theme-events",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "build": "gatsby build",
    "clean": "gatsby clean",
    "develop": "gatsby develop"
}
```

- The `"name"` corresponds to the yarn workspace you defined earlier, in the root-level `package.json` folder.
- Because we'll be installing `gatsby-theme-events` as a package, we have to specify a `"main"` entry point.
  - This file won't do anything, but it does need to resolve, so create a new file in `gatsby-theme-events` called `index.js`.

```javascript:title=gatsby-theme-events/index.js
// noop
```

Add a small comment to indicate that the file doesn't really do anything, it just needs to exist, and was left blank on purpose.

In the `package.json` file in `site`, add the following:

```json:title=site/package.json
{
  "private": true,
  "name": "site",
  "version": "1.0.0",
  "license": "MIT",
  "scripts": {
    "build": "gatsby build",
    "develop": "gatsby develop",
    "clean": "gatsby clean"
  }
}
```

- `"private"` is set to true, because you won't be publishing the site to npm.
- The `"name"` again corresponds to the yarn workspace you defined earlier, in the root-level `package.json` folder.

### Add dependencies to `site`

Now add `gatsby`, `react`, `react-dom`, and `gatsby-theme-events` as dependencies in `site`:

```shell
yarn workspace site add gatsby react react-dom gatsby-theme-events@*
```

- When you run `yarn workspace site`, it's as if you were running that command while in the `/site` directory. The dependencies will be added to `site`, even though you're not in the `site` directory.
- You're installing `gatsby-theme-events@*`, because you need the workspace to reference the unpublished `gatsby-theme-events` theme.

> 💡 For more detail on using yarn workspaces, you might be interested to check out (@TODO link Jackson's blog post)

You should now see the following dependencies in your `site/package.json`:

```json:title=site/package.json
  {
      "dependencies": {
          "gatsby": "^2.9.11",
          "gatsby-theme-events: "*",
          "react": "^16.8.6",
          "react-dom": "^16.8.6",
      }
  }
```

If you run `yarn workspaces info`, you'll be able to verify that the site is using the `gatsby-theme-events` from the workspace.

### Add peer dependencies to `gatsby-theme-events`

Targeting the `gatsby-theme-events` workspace, install `gatsby`, `react`, and `react-dom` as peer dependencies:

```shell
yarn workspace gatsby-theme-events add -P gatsby react react-dom
```

### Add development dependencies to `gatsby-theme-events`

During development, you'll use your theme as a regular Gatsby site, so you'll also set `gatsby`, `react`, and `react-dom` as dev dependencies:

```shell
yarn workspace gatsby-theme-events add -D gatsby react react-dom
```

> 💡 The `-P` flag is shorthand for installing peer dependencies, and the `-D` flag is shorthand for installing dev dependencies.

The `gatsby-theme-events/package.json` file should now include the following:

```json:title=gatsby-theme-events/package.json
{
  "peerDependencies": {
    "gatsby": "^2.9.11",
    "react": "^16.8.6",
    "react-dom": "^16.8.6"
  },
  "devDependencies": {
    "gatsby": "^2.9.11",
    "react": "^16.8.6",
    "react-dom": "^16.8.6"
  }
}
```

### Run `site` and `gatsby-theme-events`

Run both `site` and `gatsby-theme-events` to verify that they're working.

```shell
yarn workspace site develop
```

```shell
yarn workspace gatsby-theme-events develop
```

In both cases, you should see a Gatsby site successfully running in development mode. Since there's no content, visiting the site should serve a default Gatsby 404 page.

## Add static data to a theme

## Create a data directory using the `onPreBootstrap` lifecycle

## Set up to create data-driven pages

## Create data-driven pages using GraphQL and `creataPages`

## Display sorted data with `useStaticQuery`

## Style and format dates in React

## Configure a theme to take options

## Make themes extendable with gatsby-theme-ui

## Use and override a theme using component shadowing

## Publish a theme to npm

## Consume a theme in a Gatsby application

## Use component shadowing to override theme components
