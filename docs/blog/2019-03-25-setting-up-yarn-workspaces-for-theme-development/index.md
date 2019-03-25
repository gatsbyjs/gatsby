---
title: Setting up Yarn Workspaces for Theme Development
date: 2019-03-25
author: Brent Jackson
excerpt: ""
tags:
  - themes
  - yarn
  - tutorials
---

Gatsby [themes][themes-tag] are a new way to share functionality across multiple Gatsby sites.
Using [Yarn workspaces][] is an excellent way to set up a project for theme development.
It allows you to keep multiple packages in a single parent directory and link dependencies together.
For Gatsby theme development, that means you can keep multiple themes and example sites together in a single project.
In this post, we'll walk through how to use Yarn workspaces to set up a development environment for creating custom themes.

## Installation and directory structure

First, if you don't have Yarn installed already, follow the directions here to [install Yarn][].
Next, create a new directory for the entire project, where you'll be adding your theme and an example site later.

Create two subdirectories in this folder: one for the theme itself and one for the example site.

```shell
mkdir gatsby-theme-example-workspaces example
```

Add a `package.json` to the root directory with these subdirectories in the `workspaces` field.

```json:title=package.json
{
  "private": true,
  "workspaces": ["gatsby-theme-example-workspaces", "example"]
}
```

Switch to each subdirectory and run `yarn init` to create a `package.json` for each one.
Be sure the `name` field in your theme's `package.json` matches the directory name exactly.

From the root directory, run the following to install Gatsby's dependencies for the example site.

```shell
yarn workspace example add gatsby react react-dom
```

The `yarn workspace` command will run Yarn commands for a specific workspace without needing to switch directories.

Also add the following as development dependencies to the theme.

```shell
yarn workspace gatsby-theme-example-workspaces add -D gatsby react react-dom
```

In the theme's `package.json`, add these dependencies as `peerDependencies` as well.
This will help ensure that the end user of your theme can choose to use any compatible version of Gatsby with your theme.

```json:title=gatsby-theme-example-workspaces/package.json
{
  "name": "gatsby-theme-example-workspaces",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "devDependencies": {
    "gatsby": "^2.2.10",
    "react": "^16.8.5",
    "react-dom": "^16.8.5"
  },
  // highlight-start
  "peerDependencies": {
    "gatsby": "^2.2.10",
    "react": "^16.8.5",
    "react-dom": "^16.8.5"
  }
  // highlight-end
}
```

## Base theme setup

To ensure that Gatsby will compile ES6 syntax in your theme, add the following plugin to its `gatsby-config.js`.
Note that this is only needed temporarily. Gatsby will automatically transpile themes in a later version.

```shell
yarn workspace gatsby-theme-example-workspaces add gatsby-plugin-compile-es6-packages
```

```js:title=gatsby-theme-example-workspaces/gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-compile-es6-packages",
      options: {
        modules: ["gatsby-theme-example-workspaces"],
      },
    },
  ],
}
```

Create an empty `index.js` file to the theme's directory that serves as a noop (empty function).

## Example site setup

Add the theme as a dependency to the example site.
By specifying the version here, Yarn will install the local dependency that hasn't been published to npm yet.

```shell
yarn workspace example add gatsby-theme-example-workspaces@1.0.0
```

In the example site, create a `gatsby-config.js` file and add the theme.

```js:title=example/gatsby-config.js
module.exports = {
  __experimentalThemes: ["gatsby-theme-example-workspaces"],
}
```

Add a `src/pages/` directory and add a simple _Hello, world_ page.

```js:title=example/src/pages/index.js
import React from "react"

export default props => <h1>Hello, world</h1>
```

Add Gatsby scripts to the example site's `package.json`.

```json:title=example/package.json
{
  "name": "example",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  // highlight-start
  "scripts": {
    "develop": "gatsby develop",
    "build": "gatsby build"
  },
  // highlight-end
  "dependencies": {
    "gatsby": "^2.2.10",
    "gatsby-theme-example-workspaces": "1.0.0",
    "react": "^16.8.5",
    "react-dom": "^16.8.5"
  }
}
```

Test your example site out to make sure everything is working as expected.

```shell
yarn workspace example develop
```

Open your browser to `http://localhost:8000` where you should see your _Hello, world_ page.

## Adding functionality to the theme

Currently, the theme does nothing.
This is the minimal amount of code required to develop a theme with Yarn workspaces.

To demonstrate the theme in action...

**QUESTION** what should the theme do here?

- Add base CSS styles
- Add a plugin
- Add a page

That's it! By now you should have a basic Yarn workspaces setup to develop Gatsby themes with.
Be sure to look for more posts on developing Gatsby themes in the near future,
and you can read more about themes on the [blog][themes-tag].

[themes-tag]: /blog/tags/themes
[yarn]: https://yarnpkg.com
[yarn workspaces]: https://yarnpkg.com/lang/en/docs/workspaces/
[install yarn]: https://yarnpkg.com/en/docs/install
