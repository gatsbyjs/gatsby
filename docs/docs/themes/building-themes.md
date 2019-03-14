---
title: Building Themes
---

> ⚠⚠ Gatsby Themes are currently experimental ⚠⚠

## Initialize a theme

```sh
mkdir gatsby-theme-developer
cd gatsby-theme-developer
git init
npm init -y
npm i -D gatsby react react-dom
```

## Add dependencies

Then you need to specify `gatsby`, `react`, and `react-dom` as peer dependencies.

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

Then create a `src/pages/index.js`:

```sh
mkdir -p src/pages
```

```js:title=src/pages/index.js
import React from "react"

export default () => <h1>Hello from gatsby-theme-developer</h1>
```

And create a `gatsby-config.js` that sources pages:

```sh
npm i --save gatsby-plugin-page-creator gatsby-plugin-compile-es6-packages
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

## Add theme transpilation

**Note**: This is only needed temporarily. Themes will automatically be transpiled in later versions.

Since your theme will be installed as a dependency it will end up in `node_modules` which Gatsby
doesn't transpile by default. This is something you can achieve with `gatsby-plugin-compile-es6-packages`.

You will need to install the package:

```sh
yarn add gatsby-plugin-compile-es6-packages
```

And then add it to your plugins list:

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
    {
      resolve: "gatsby-plugin-compile-es6-packages",
      options: {
        modules: ["gatsby-theme-developer"],
      },
    },
  ],
}
```

## Create your starter

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

### Add some seed content

In your starter you can add seed content so when the site is first run there
is something to display. This often means some examples posts or project
content.

When a user installs your starter all they will see is the content since the
theme internals are hidden away as a library!
