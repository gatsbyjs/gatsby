---
title: Setting up Yarn Workspaces for Theme Development
date: 2019-05-22
author: Brent Jackson
excerpt: ""
tags:
  - themes
  - getting-started
---

Gatsby [themes][themes-tag] are a new way to share functionality across multiple Gatsby sites.
[Yarn workspaces][] are an excellent way to set up a project for theme development because they allow you to keep multiple packages in a single parent directory and link dependencies together.
For Gatsby theme development, that means you can keep multiple themes and example sites together in a single project.
In this post, we'll walk through how to use Yarn workspaces to set up a development environment for creating custom themes.

## Installation and directory structure

First, if you don't have Yarn installed already, follow the directions here to [install Yarn][].
Next, create a new directory for the entire project, where you'll be adding your theme and an example site later.

Create two subdirectories in this folder: one for the theme itself and one for the example site.

```shell
mkdir gatsby-theme-example-workspaces example
```

Add a `package.json` to the root directory with these subdirectories in the `workspaces` field. Note that setting `"private": true` is required for Yarn workspaces.

```json:title=package.json
{
  "private": true,
  "workspaces": ["gatsby-theme-example-workspaces", "example"]
}
```

Change to each subdirectory and run `yarn init -y` to create a `package.json` for each one.
Be sure the `name` field in your theme's `package.json` matches the directory name exactly.
This is currently a limitation of Gatsby theme shadowing, not Yarn workspaces.

Your directory structure should now look like this:

```
example/
  package.json
gatsby-theme-example-workspaces/
  package.json
```

From the root directory, run the following to install Gatsby's dependencies for the example site.

```shell
yarn workspace example add gatsby react react-dom
```

The `yarn workspace <package>` command will run Yarn commands for a specific workspace without needing to switch directories.

Then add the following as peer dependencies to the theme.
This will ensure that the end user of your theme can choose any compatible version of Gatsby.

```shell
yarn workspace gatsby-theme-example-workspaces add --peer gatsby react react-dom
```

## Base theme setup

Add a `gatsby-config.js` file to the theme directory.

```js:title=gatsby-theme-example-workspaces/gatsby-config.js
module.exports = {
  plugins: [],
}
```

Change the `main` field in your theme's `package.json` to point to the `gatsby-config.js` file.

```json:title=gatsby-theme-example-workspaces/package.json
{
  "name": "gatsby-theme-example-workspaces",
  "description": "",
  "version": "1.0.0",
  "main": "gatsby-config.js", // highlight-line
  "license": "MIT",
  "peerDependencies": {
    "gatsby": "^2.2.10",
    "react": "^16.8.5",
    "react-dom": "^16.8.5"
  }
}
```

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

Add a `src/pages/` directory and add a _Hello, world_ page.

```js:title=example/src/pages/index.js
import React from "react"

export default props => <h1>Hello, world</h1>
```

Add Gatsby develop and build scripts to the example site's `package.json`.

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

To demonstrate the theme in action, use `gatsby-plugin-page-creator` to add a page from the theme.

```shell
yarn workspace gatsby-theme-example-workspaces add gatsby-plugin-page-creator
```

```js:title=gatsby-theme-example-workspaces/gatsby-config.js
const path = require("path") // highlight-line
module.exports = {
  plugins: [
    // highlight-start
    {
      resolve: "gatsby-plugin-page-creator",
      options: {
        path: path.join(__dirname, "src/pages"),
      },
    },
    // highlight-end
  ],
}
```

Make a `src/pages` directory in the theme and add a demo page.

```js:title=gatsby-theme-example-workspaces/src/pages/theme-page.js
import React from "react"

export default props => <h1>Hello, from the theme!</h1>
```

Stop and restart the Gatsby development server to pick up the new page from the theme. The theme's page should be visible at `http://localhost:8080/theme-page`.

That's it! By now you should have a basic Yarn workspaces setup to develop Gatsby themes with.
Be sure to look for more posts on developing Gatsby themes in the near future,
and you can read more about themes here on the [blog][themes-tag].

[themes-tag]: /blog/tags/themes
[yarn]: https://yarnpkg.com
[yarn workspaces]: https://yarnpkg.com/lang/en/docs/workspaces/
[install yarn]: https://yarnpkg.com/en/docs/install
