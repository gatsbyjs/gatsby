---
title: Building Themes
---

> ⚠⚠ Gatsby Themes are currently experimental ⚠⚠

## Gatsby Theme Starter

There's a Gatsby Theme Starter which you can use to get up and running quickly:

```sh
npx gatsby new https://github.com/ChristopherBiscardi/gatsby-starter-theme
```

This starter will set you up with a yarn workspace and example site which you can
use to develop your theme. Yarn is required in this project since npm doesn't offer
workspace functionality. If you haven't set up yarn you can follow along with the
[yarn setup guide](/contributing/setting-up-your-local-dev-environment/#using-yarn).

If you'd like to walk through setting up a theme project from scratch each step is
detailed below.

## Initialize a Theme

For the purposes of this tutorial we will be using the name `gatsby-theme-developer`.
You will likely want to replace `developer` with your own theme name.

To get started, create a directory for your project, initialize npm and install the
required dependencies.

```sh
mkdir gatsby-theme-developer
cd gatsby-theme-developer
git init
npm init -y
npm i -D gatsby react react-dom
```

## Add Dependencies

Then, you need to specify `gatsby`, `react`, and `react-dom` as peer dependencies in your theme's `package.json` file. This
will warn users that install your theme if they're missing those dependencies since they're
required. The `peerDependencies` approach also allows users to determine what versions
of Gatsby and React that they'd like to use.

```json
{
  "name": "gatsby-theme-developer",
  "description": "Gatsby theme for developers",
  "author": "John Otander",
  "version": "0.0.1",
  "main": "index.js",
  "keywords": ["gatsby-theme"],
  "scripts": {
    "develop": "gatsby develop"
  },
  "peerDependencies": {
    "gatsby": "^2.1.9",
    "react": "^16.8.2",
    "react-dom": "^16.8.2"
  },
  "devDependencies": {
    "gatsby": "^2.1.9",
    "react": "^16.8.2",
    "react-dom": "^16.8.2"
  }
}
```

Next, create an `index.js` entrypoint that serves as a noop (an empty function):

```js:title=index.js
// noop
```

Then create a `src/pages/index.js`:

```sh
mkdir -p src/pages
```

```js:title=src/pages/index.js
import React from "react"

export default () => <h1>Hello from gatsby-theme-developer</h1>
```

You'll need to install two packages and create a `gatsby-config.js` that sources `pages`:

```sh
npm i --save gatsby-plugin-page-creator
```

```js:title=gatsby-config.js
const path = require("path")

module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-page-creator",
      options: {
        path: path.join(__dirname, "src", "pages"),
      },
    },
  ],
}
```

## Add Theme Transpilation

You will need to set up your theme to be automatically transpiled by Gatsby. This
doesn't happen by default because your theme will end up in an end user's `node_modules`
directory.

[See how to set up theme transpilation](/docs/themes/api-reference#add-theme-transpilation)

## Publish to NPM

In order to allow others to install your theme you will need to publish it to npm. If you haven't published to npm before, learn how [here](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry).

From the root of your `gatsby-theme-developer` you can run `npm publish`.

## Create Your Starter

```sh
cd ..
mkdir gatsby-starter-developer
git init
npm init -y
npm install --save gatsby-theme-developer gatsby react react-dom
```

Then create your config:

```js:title=gatsby-config.js
module.exports = {
  __experimentalThemes: ["gatsby-theme-developer"],
}
```

### Add Some Seed Content

In your starter you can add seed content so when the site is first run there
is something to display. This often means some examples posts or project
content.

When a user installs your starter all they will see is the content since the
theme internals are hidden away as a library!

### Make it accessible by default

To ensure your themes are usable by the widest range of people, we highly encourage including
accessible styles and defaults like color contrast, keyboard functionality, and assistive
technology support. For more information, visit our [accessibility page](/docs/making-your-site-accessible/)
and resources like the [A11y Project](https://a11yproject.com) and [WebAIM](https://webaim.org).
