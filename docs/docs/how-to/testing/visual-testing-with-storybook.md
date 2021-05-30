---
title: Visual Testing with Storybook
---

Knowing your components look as intended in every permutation is not only a great way to test them visually, but also provides "living documentation" for them. This makes it easier for teams to:

1. know what components are available to them in a given project and
2. what props those components accept and what all of the states of that component are.

As your project grows over time having this information available will be invaluable. This is the function of the [Storybook](https://storybook.js.org/) library. Storybook is a UI development environment for your UI components. With it, you can visualize different states of your UI components and develop them interactively.

## Setting up your environment

> Note that the following instructions are using [npx](https://www.npmjs.com/package/npx). `npx` is a part of npm and in this case it allows you to automatically generate a file/folder structure complete with the default configuration. If you're running an older version of `npm` (`<5.2.0`) you should run the following command instead: `npm install -g @storybook/cli`. You can then run `sb init` from your Gatsby root directory to initialize Storybook.

To set up Storybook you need to install dependencies and do some custom configuration. You can get started quickly by using the automated command line tool from your Gatsby root directory:

```shell
npx -p @storybook/cli sb init
```

This command adds a set of boilerplate files for Storybook in your project. However, since this is for a Gatsby project, you need to update the default Storybook configuration a bit so you don't get errors when trying to use Gatsby specific components inside of the stories.

### Storybook version 6

Storybook v6 uses Webpack v4 by default, while [Gatsby v3 uses webpack v5](https://www.gatsbyjs.com/docs/reference/release-notes/migrating-from-v2-to-v3/#webpack-upgraded-from-version-4-to-version-5). Hence, the Webpack version for Storybook should be upgraded to v5 to prevent conflicts.

Storybook v6.2 has added [experimental Webpack v5 support](https://storybook.js.org/blog/storybook-for-webpack-5/), however bound to work without issues with the upcoming v6.3 release. At the time of writing this guide, v6.3 is only available as beta and hence be used as such.

Upgrade the existing Storybook version

```shell
npx sb@next upgrade --prerelease
```

Add Webpack v5 builder

```shell
npm i -D @storybook/builder-webpack5@next @storybook/manager-webpack5@next
```

Then update your `.storybook/main.js` file to use Webpack v5

```js:title=.storybook/main.js
module.exports = {
  ...
  core: {
    builder: "webpack5",
  },
  ...
};
```

Then update Storybook's Webpack configuration to include Gatsby module for Webpack processing and include the `babel-plugin-remove-graphql-queries` to remove static queries from the components

```js:title=.storybook/main.js
module.exports = {
  ...
  webpackFinal: async (config) => {
    // transpile Gatsby module because Gatsby includes un-transpiled ES6 code.
    config.module.rules[0].exclude = [/node_modules\/(?!(gatsby)\/)/]
   
    // use babel-plugin-remove-graphql-queries to remove static queries from components when rendering in storybook
    config.module.rules[0].use[0].options.plugins.push(require.resolve("babel-plugin-remove-graphql-queries"))

    return config
  },
  ...
};
```

The final `.storybook/main.js` file would look like

```js:title=.storybook/main.js
module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  // highlight-start
  "core": {
    "builder": "webpack5"
  },
  webpackFinal: async (config) => {
    // Transpile Gatsby module because Gatsby includes un-transpiled ES6 code.
    config.module.rules[0].exclude = [/node_modules\/(?!(gatsby)\/)/]
   
    // use babel-plugin-remove-graphql-queries to remove static queries from components when rendering in storybook
    config.module.rules[0].use[0].options.plugins.push(require.resolve("babel-plugin-remove-graphql-queries"))

    return config
  },
  // highlight-end
}
```

Finally, add snippets to prevent certain errors using Gatsby components like [Links](https://www.gatsbyjs.com/docs/reference/built-in-components/gatsby-link/) etc. inside of Storybook.

```js:title=.storybook/preview.js
import { action } from "@storybook/addon-actions"
...
// Gatsby's Link overrides:
// Gatsby Link calls the `enqueue` & `hovering` methods on the global variable ___loader.
// This global object isn't set in storybook context, requiring you to override it to empty functions (no-op),
// so Gatsby Link doesn't throw errors.
global.___loader = {
  enqueue: () => {},
  hovering: () => {},
}
// This global variable prevents the "__BASE_PATH__ is not defined" error inside Storybook.
global.__BASE_PATH__ = "/"

// Navigating through a gatsby app using gatsby-link or any other gatsby component will use the `___navigate` method.
// In Storybook it makes more sense to log an action than doing an actual navigate. Checkout the actions addon docs for more info: https://github.com/storybookjs/storybook/tree/master/addons/actions.

window.___navigate = pathname => {
  action("NavigateTo:")(pathname)
}
```

The final code for `.storybook/preview.js` looks like

```js:title=.storybook/preview.js
// highlight-start
import { action } from "@storybook/addon-actions"
// highlight-end

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

// highlight-start
// Gatsby's Link overrides:
// Gatsby Link calls the `enqueue` & `hovering` methods on the global variable ___loader.
// This global object isn't set in storybook context, requiring you to override it to empty functions (no-op),
// so Gatsby Link doesn't throw errors.
global.___loader = {
  enqueue: () => {},
  hovering: () => {},
}
// This global variable prevents the "__BASE_PATH__ is not defined" error inside Storybook.
global.__BASE_PATH__ = "/"

// Navigating through a gatsby app using gatsby-link or any other gatsby component will use the `___navigate` method.
// In Storybook it makes more sense to log an action than doing an actual navigate. Checkout the actions addon docs for more info: https://github.com/storybookjs/storybook/tree/master/addons/actions.

window.___navigate = pathname => {
  action("NavigateTo:")(pathname)
}
// highlight-end
```

#### TypeScript Support

The Storybook v6 has [out-of-the-box support for Typescript](https://storybook.js.org/docs/react/configure/typescript). The stories and components can be authored with `.tsx` extension

### Storybook version 5

Storybook version 5.3 [brought a major change to how Storybook is configured](https://medium.com/storybookjs/declarative-storybook-configuration-49912f77b78).

When you first install Storybook the only configuration file that will exist is `.storybook/main.js`, which will have the default stories location and default addons.

```js:title=.storybook/main.js
module.exports = {
  stories: ["../stories/**/*.stories.js"],
  addons: ["@storybook/addon-actions", "@storybook/addon-links"],
}
```

Adjustments to Storybook's default `webpack` configuration are required so that you can transpile Gatsby source files and to ensure you have the necessary Babel plugins to transpile Gatsby components. Add the following section to the `module.exports` object in `.storybook/main.js`.

```js:title=.storybook/main.js
webpackFinal: async config => {
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
    config.resolve.mainFields = ["browser", "module", "main"];

    return config;
  },
```

The final output will look as follows:

```js:title=.storybook/main.js
module.exports = {
  // You will want to change this to wherever your Stories will live.
  stories: ["../stories/**/*.stories.js"],
  addons: ["@storybook/addon-actions", "@storybook/addon-links"],
  // highlight-start
  webpackFinal: async config => {
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
  },
  // highlight-end
}
```

Next create a new file under `.storybook` called `preview.js`. This configuration file preview.js is not responsible for loading any stories. Its main purpose is to add global parameters and [decorators](https://storybook.js.org/docs/addons/introduction/#1-decorators).

```js:title=.storybook/preview.js
import { action } from "@storybook/addon-actions"

// Gatsby's Link overrides:
// Gatsby Link calls the `enqueue` & `hovering` methods on the global variable ___loader.
// This global object isn't set in storybook context, requiring you to override it to empty functions (no-op),
// so Gatsby Link doesn't throw any errors.
global.___loader = {
  enqueue: () => {},
  hovering: () => {},
}
// This global variable is prevents the "__BASE_PATH__ is not defined" error inside Storybook.
global.__BASE_PATH__ = "/"

// Navigating through a gatsby app using gatsby-link or any other gatsby component will use the `___navigate` method.
// In Storybook it makes more sense to log an action than doing an actual navigate. Checkout the actions addon docs for more info: https://github.com/storybookjs/storybook/tree/master/addons/actions.

window.___navigate = pathname => {
  action("NavigateTo:")(pathname)
}
```

#### Add TypeScript Support

To configure TypeScript with Storybook and Gatsby, add the following configuration to `.storybook/main.js`.

Add `tsx` as a file type to look for in the `stories` array. This assumes the default Storybook path, but the array configuration can be modified to where your stories live.

```js:title=.storybook/main.js
stories: ["../stories/**/*.stories.js","../stories/**/*.stories.tsx"],
```

Add the following code after the line containing `config.resolve.mainFields = ["browser", "module", "main"];` (line 25) and before the `return config;` in the same function body (line 27):

```js:title=.storybook/main.js
config.module.rules.push({
  test: /\.(ts|tsx)$/,
  loader: require.resolve("babel-loader"),
  options: {
    presets: [["react-app", { flow: false, typescript: true }]],
    plugins: [
      require.resolve("@babel/plugin-proposal-class-properties"),
      // use babel-plugin-remove-graphql-queries to remove static queries from components when rendering in storybook
      require.resolve("babel-plugin-remove-graphql-queries"),
    ],
  },
})

config.resolve.extensions.push(".ts", ".tsx")
```

The final output, with TypeScript support, will look as follows:

```js:title=.storybook/main.js
module.exports = {
  // highlight-start
  stories: ["../stories/**/*.stories.js", "../stories/**/*.stories.tsx"],
  // highlight-end
  addons: ["@storybook/addon-actions", "@storybook/addon-links"],
  webpackFinal: async config => {
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

    // highlight-start
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      loader: require.resolve("babel-loader"),
      options: {
        presets: [["react-app", { flow: false, typescript: true }]],
        plugins: [
          require.resolve("@babel/plugin-proposal-class-properties"),
          // use babel-plugin-remove-graphql-queries to remove static queries from components when rendering in storybook
          require.resolve("babel-plugin-remove-graphql-queries"),
        ],
      },
    })

    config.resolve.extensions.push(".ts", ".tsx")

    // highlight-end
    return config
  },
}
```

The `babel-preset-react-app` package will also need to be installed.

```shell
npm install --save-dev babel-preset-react-app
```

With setup completed for Storybook 5, you can continue with the [information below to write stories](#writing-stories).

### Storybook version 4

To use Storybook version 4 with Gatsby, use the following setup instructions:

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

export default {
  title: "Dashboard/header",
}

export const exampleStory = () => (
  <div style={{ padding: "16px", backgroundColor: "#eeeeee" }}>
    <h1 style={{ color: "rebeccapurple" }}>Hello from Storybook and Gatsby!</h1>
  </div>
)
```

This is a very simple story without much going on, but honestly, nothing else really changes as related to Gatsby. If you want to learn more about how Storybook works and what you can do with it, check out some of the resources listed below.

## Other resources

- For more information on Storybook, visit
  [the Storybook site](https://storybook.js.org/).
- Get started with a [Jest and Storybook starter](https://github.com/Mathspy/gatsby-storybook-jest-starter)
