---
title: Visual Testing with Storybook
---

Knowing your components look as intended in every permutation is not only a great way to test them visually, but also provides "living documentation" for them. This makes it easier for teams to:

1. know what components are available to them in a given project and
2. what props those components accept and what all of the states of that component are.

As your project grows over time having this information available will be invaluable. This is the function of the [Storybook](https://storybook.js.org/) library. Storybook is a UI development environment for your UI components. With it, you can visualize different states of your UI components and develop them interactively.

## Setting up your environment

To set up Storybook you need to install dependencies and do some custom configuration. First, install the Storybook CLI.

```shell
npm install -g @storybook/cli
```

Once the CLI is installed, the next step is to run the `sb init` command that is now available from the root directory of your Gatsby project.

```shell
cd my-awesome-gatsby-project
sb init
```

> Note that if you're running a recent version of `npm` (5.2.0+) you can run the following single command instead: `npx -p @storybook/cli sb init`, which is the recommended method by Storybook. This doesn't install the CLI on your machine, thereby ensuring you're always running the latest version of the CLI.

The `sb init` command bootstraps the basic config necessary to run Storybook for a React project. However, since this is for a Gatsby project, you need to update the default Storybook configuration a bit so you don't get errors when trying to use Gatsby specific components inside of the stories.

To update your Storybook config open `.storybook/config.js` and modify the content as follows:

```js:title=.storybook/config.js
import { configure } from "@storybook/react"
import { action } from "@storybook/addon-actions"

// automatically import all files ending in *.stories.js
// highlight-next-line
const req = require.context("../src", true, /.stories.js$/)
function loadStories() {
  req.keys().forEach(filename => req(filename))
}

// highlight-start
// Gatsby's Link overrides:
// Gatsby defines a global called ___loader to prevent its method calls from creating console errors you override it here
global.___loader = {
  enqueue: () => {},
  hovering: () => {},
}

// Gatsby internal mocking to prevent unnecessary errors in storybook testing environment
global.__PATH_PREFIX__ = ""

// This is to utilized to override the window.___navigate method Gatsby defines and uses to report what path a Link would be taking us to if it wasn't inside a storybook
window.___navigate = pathname => {
  action("NavigateTo:")(pathname)
}

configure(loadStories, module)
// highlight-end
```

> You can remove the `stories` folder from the root of your project, or move it inside your `src` folder

Next make some adjustments to Storybook's default `webpack` configuration so you can transpile Gatsby source files, and to ensure you have the necessary `babel` plugins to transpile Gatsby components.

Create a new file called `webpack.config.js` in the `.storybook` folder created by the Storybook CLI. Then place the following code in that file (depending on which version of Storybook you're using):

**For Storybook v5:**

```js:title=.storybook/webpack.config.js
module.exports = ({ config }) => {
  // Transpile Gatsby module because Gatsby includes un-transpiled ES6 code.
  config.module.rules[0].exclude = [/node_modules\/(?!(gatsby)\/)/]

  // use installed babel-loader which is v8.0-beta (which is meant to work with @babel/core@7)
  config.module.rules[0].use[0].loader = require.resolve("babel-loader")

  // use @babel/preset-react for JSX and env (instead of staged presets)
  config.module.rules[0].use[0].options.presets = [
    require.resolve("@babel/preset-react"),
    require.resolve("@babel/preset-env"),
  ]

  config.module.rules[0].use[0].options.plugins = [
    // use @babel/plugin-proposal-class-properties for class arrow functions
    require.resolve("@babel/plugin-proposal-class-properties"),
    // use babel-plugin-remove-graphql-queries to remove static queries from components when rendering in storybook
    require.resolve("babel-plugin-remove-graphql-queries"),
  ]

  // Prefer Gatsby ES6 entrypoint (module) over commonjs (main) entrypoint
  config.resolve.mainFields = ["browser", "module", "main"]

  return config
}
```

> Note that if you're using a [StaticQuery](/docs/static-query/) in your components, `babel-plugin-remove-graphql-queries` is required to render them in Storybook. This is because the queries are run at build time in Gatsby, and will not have been run when rendering the components directly.

> When using TypeScript, add this rule:

```js:title=.storybook/webpack.config.js

config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: [['react-app', {flow: false, typescript: true}]],
      plugins: [
        require.resolve('@babel/plugin-proposal-class-properties'),
        // use babel-plugin-remove-graphql-queries to remove static queries from components when rendering in storybook
        require.resolve('babel-plugin-remove-graphql-queries'),
      ],
    },
  });
  config.resolve.extensions.push('.ts', '.tsx');

  return config
}
```

**For Storybook v4:**

```js:title=.storybook/webpack.config.js
module.exports = (baseConfig, env, defaultConfig) => {
  // Transpile Gatsby module because Gatsby includes un-transpiled ES6 code.
  defaultConfig.module.rules[0].exclude = [/node_modules\/(?!(gatsby)\/)/]

  // use installed babel-loader which is v8.0-beta (which is meant to work with @babel/core@7)
  defaultConfig.module.rules[0].use[0].loader = require.resolve("babel-loader")

  // use @babel/preset-react for JSX and env (instead of staged presets)
  defaultConfig.module.rules[0].use[0].options.presets = [
    require.resolve("@babel/preset-react"),
    require.resolve("@babel/preset-env"),
  ]

  defaultConfig.module.rules[0].use[0].options.plugins = [
    // use @babel/plugin-proposal-class-properties for class arrow functions
    require.resolve("@babel/plugin-proposal-class-properties"),
    // use babel-plugin-remove-graphql-queries to remove static queries from components when rendering in storybook
    require.resolve("babel-plugin-remove-graphql-queries"),
  ]

  // Prefer Gatsby ES6 entrypoint (module) over commonjs (main) entrypoint
  defaultConfig.resolve.mainFields = ["browser", "module", "main"]

  return defaultConfig
}
```

Once you have this configured you should run Storybook to ensure it can start up properly and you can see the default stories installed by the CLI. To run storybook:

```shell
npm run storybook
```

Storybook CLI adds this command to your `package.json` for you so you shouldn't have to anything other than run the command. If Storybook builds successfully you should be able to navigate to `http://localhost:6006` and see the default stories supplied by the Storybook CLI.

However, if you use `StaticQuery` or `useStaticQuery` in your project Storybook needs to be run with the `NODE_ENV` set to `production` (as Storybook sets this by default to `development`). Otherwise `babel-plugin-remove-graphql-queries` won't be run. Moreover Storybook needs to know about [static files](https://storybook.js.org/docs/configurations/serving-static-files/#2-via-a-directory) generated by Gatsby's `StaticQuery`. Your scripts should look like:

```json:title=package.json
{
  "scripts": {
    "storybook": "NODE_ENV=production start-storybook -s public",
    "build-storybook": "NODE_ENV=production build-storybook -s public"
  }
}
```

## Writing stories

A full guide to writing stories is beyond the scope of this guide, but we'll take a look at creating a story.

First, create the story file. Storybook looks for all files with a `.stories.js` extension and loads them into Storybook for you. Generally you will want your stories near where the component is defined, however since this is Gatsby, if you want stories for your pages, you will have to create those files outside of the `pages` directory.

> A good solution is to create a `__stories__` directory next to your `pages` directory and put any page stories in there.

```jsx:title=src/components/example.stories.js
import React from "react"
import { storiesOf } from "@storybook/react"

storiesOf(`Dashboard/Header`, module).add(`default`, () => (
  <div style={{ padding: `16px`, backgroundColor: `#eeeeee` }}>
    <h1 style={{ color: "rebeccapurple" }}>Hello from Storybook and Gatsby!</h1>
  </div>
))
```

This is a very simple story without much going on, but honestly, nothing else really changes as related to Gatsby. If you want to learn more about how Storybook works and what you can do with it, check out some of the resources listed below.

## Other resources

- For more information on Storybook, visit
  [the Storybook site](https://storybook.js.org/).
- Get started with a [Jest and Storybook starter](https://github.com/Mathspy/gatsby-storybook-jest-starter)
