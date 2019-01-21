---
title: "Writing documentation with Docz"
---

Writing good documentation is important for your project maintainers (and for your future self!). A very nice documentation generator is [Docz](https://www.docz.site). It supports `mdx` files, which is short for Markdown with JSX. That means you can render React components in these special Markdown files. It can generate Prop tables and even provide a coding playground for your components!

If you are starting your Gatsby project from scratch and would like to have Docz support out of the box, you can use the starter given in [Other Resources](#other-resources) below.

Alternatively, the following guide should help you to get Docz working within an existing Gatsby project.

## Setting up your environment

To set up Docz you need to install dependencies and do some custom configuration. First, make sure you are in the root directory of your Gatsby project.

```shell
cd my-awesome-gatsby-project
```

Install the necessary dev dependencies to get a Docz site up and running.

```shell
npm install --save-dev docz docz-theme-default docz-plugin-css @babel/plugin-syntax-dynamic-import webpack-merge
```

Add the following scripts to your `package.json` file:

```json:title=package.json
{
    ...
    "scripts": {
        ...
        "docz:dev": "docz dev",
        "docz:build": "docz build",
        ...
    }
    ...
}
```

Create these two files:

- `doczrc.js` to configure Docz,
- `docz/wrapper.js` to inject some JavaScript in Docz pages, to ensure compatibility with Gatsby.

Create a new folder `docz`, and inside that folder, a new file `wrapper.js`. Copy and paste there the following code:

```js:title=docz/wrapper.js
import * as React from "react"

// Gatsby's Link overrides:
// Gatsby internal mocking to prevent unnecessary error in docz: __PATH_PREFIX__ is not defined
global.__PATH_PREFIX__ = ""

export default ({ children }) => children
```

> We are essentially creating a dummy wrapper that does nothing else than making sure that `global.__PATH_PREFIX__` is defined on every page.

Create a new file called `doczrc.js` in the root directory of your Gatsby project, and add the following content:

```js:title=doczrc.js
import merge from "webpack-merge"
import { css } from "docz-plugin-css"

export default {
  title: "Docz with Gatsby",
  // Add CSS support in case you use them in your Gatsby project
  plugins: [css()],
  // highlight-next-line
  // Wrapper used to inject some global variable mocks
  wrapper: "docz/wrapper.js",
  modifyBundlerConfig: config => {
    const gatsbyNecessaryConfig = {
      module: {
        rules: [
          {
            // Transpile Gatsby module because Gatsby includes un-transpiled ES6 code.
            // Ignore .json files because they fail to be parsed
            exclude: [/node_modules\/(?!(gatsby)\/)/, /\.json$/],
            use: [
              {
                // use installed babel-loader which is v8.0-beta (which is meant to work with @babel/core@7)
                loader: "babel-loader",
                options: {
                  // use @babel/preset-react for JSX and env (instead of staged presets)
                  presets: ["@babel/preset-react", "@babel/preset-env"],
                  plugins: [
                    // use @babel/plugin-proposal-class-properties for class arrow functions
                    "@babel/plugin-proposal-class-properties",
                    // use @babel/plugin-syntax-dynamic-import for dynamic import support
                    "@babel/plugin-syntax-dynamic-import",
                  ],
                },
              },
            ],
          },
        ],
      },
    }

    return merge(gatsbyNecessaryConfig, config)
  },
}
```

Once you have this configured you should run Docz to ensure it can start up properly. You should see by default a _Page Not Found_ page: You haven't created any `mdx` file yet. To run Docz:

```shell
npm run docz:dev
```

If Docz builds successfully you should be able to navigate to `http://localhost:3000` and see the default _Page Not Found_ page.

## Writing documentation

Docz searches your directory for `mdx` files and renders them. Let's add you first documentation page by creating a file `index.mdx` in the root directory of your Gatsby project.

```mdx:title=index.mdx
---
name: Getting started
route: /
---

# Getting Started

This is the start of an amazing Docz site
```

This is a very simple documentation page without much going on, but let's spice things up by adding and rendering a Gatsby component. Assuming you have a header component in your components folder which does not rely on `StaticQuery` or `graphql`, you can add:

```mdx:title=index.mdx
---
name: Getting started
route: /
---

//highlight-next-line
import Header from './src/components/header'

# Getting Started

This is the start of an amazing Docz site

//highlight-next-line
<Header siteTitle="Hello from Gatsby" />
```

Restart the Docz server and voilà!

## Other resources

- For more information on Docz, visit
  [the Docz site](https://docz.site/).
- Get started with a [Docz starter](https://github.com/RobinCsl/gatsby-starter-docz)
