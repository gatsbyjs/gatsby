---
title: Writing Themes
---

Initialize a theme project

```sh
mkdir gatsby-theme-developer
cd gatsby-theme-developer
git init
npm init -y
npm i -D gatsby react react-dom
```

Then you need to specify `gatsby`, `react`, and `react-dom` as peer dependencies.

```json
{
  "name": "gatsby-theme-developer",
  "description": "Gatsby theme for developers",
  "author": "John Otander",
  "version": "0.0.1",
  "main": "index.js",
  "keywords": ["gatsby-theme"],
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
    "gatsby-plugin-compile-es6-packages",
  ],
}
```

**Note:** `gatsby-plugin-compile-es6-packages` is used to ensure that all of a theme's code is transpiled

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

## **Principles**

- separating templates (with queries) and components
- accessing theme options
- base themes for data handling
- stylistic themes
- child theming
- documenting themes (potentially via automated tooling)
