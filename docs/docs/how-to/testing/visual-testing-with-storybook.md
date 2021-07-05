---
title: Visual Testing with Storybook
---

Knowing your components look as intended in every permutation is not only a great way to test them visually, but also provides "living documentation" for them. This makes it easier for teams to:

1. know what components are available to them in a given project and
2. what props those components accept and what all of the states of that component are.

As your project grows over time having this information available will be invaluable. This is the function of the [Storybook](https://storybook.js.org/) library. Storybook is a UI development environment for your UI components. With it, you can visualize different states of your UI components and develop them interactively.

## Setting up your environment

> **Note:** The following instructions are using [npx](https://www.npmjs.com/package/npx). `npx` is a part of npm and in this case it allows you to automatically generate a file/folder structure complete with the default configuration. If you're running an older version of `npm` (`<5.2.0`) you should run the following command instead: `npm install -g @storybook/cli`. You can then run `sb init` from your Gatsby root directory to initialize Storybook.

To set up Storybook you need to install dependencies and do some custom configuration. You can get started quickly by using the automated command line tool from your Gatsby root directory:

```shell
npx -p @storybook/cli sb init
```

This command adds a set of boilerplate files for Storybook in your project. However, since this is for a Gatsby project, you need to update the default Storybook configuration a bit so you don't get errors when trying to use Gatsby specific components inside of the stories. You should have a configuration file at `.storybook/main.js` now.

## Configuration

> **Note:** Make sure that you are using a Storybook version `>6.3.0` before following the instructions below. For older versions of Storybook you can visit the [Gatsby v2 documentation](https://v2.gatsbyjs.com/docs/how-to/testing/visual-testing-with-storybook/).

Storybook v6 uses webpack v4 by default, while Gatsby uses webpack v5. Hence, the webpack version for Storybook should be changed to match that of Gatsby to prevent conflicts. Storybook has [official webpack v5 support](https://storybook.js.org/blog/storybook-for-webpack-5/) and can be enabled in your Storybook config.

Install the necessary npm packages:

```shell
npm i -D @storybook/builder-webpack5 @storybook/manager-webpack5
```

Update your `.storybook/main.js` file to use webpack v5:

```js:title=.storybook/main.js
module.exports = {
  core: {
    builder: "webpack5",
  },
};
```

Adjustments to Storybook's default webpack configuration are required so that you can transpile Gatsby source files and to ensure you have the necessary Babel plugins to transpile Gatsby components. Add the following section to your `.storybook/main.js`:

```js:title=.storybook/main.js
module.exports = {
  webpackFinal: async (config) => {
    // transpile Gatsby module because Gatsby includes un-transpiled ES6 code.
    config.module.rules[0].exclude = [/node_modules\/(?!(gatsby)\/)/]

    // use babel-plugin-remove-graphql-queries to remove static queries from components when rendering in storybook
    config.module.rules[0].use[0].options.plugins.push(require.resolve("babel-plugin-remove-graphql-queries"))

    return config
  },
};
```

The final `.storybook/main.js` should look something like this:

```js:title=.storybook/main.js
module.exports = {
  // You will want to change this to wherever your Stories will live
  stories: [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  // highlight-start
  core: {
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

Create a new file under `.storybook` called `preview.js`. This configuration file `preview.js` is not responsible for loading any stories but for [configuring story rendering](https://storybook.js.org/docs/react/configure/overview#configure-story-rendering). Its main purpose is to add [global parameters](https://storybook.js.org/docs/react/writing-stories/parameters#global-parameters) and [decorators](https://storybook.js.org/docs/react/writing-stories/decorators).

```js:title=.storybook/preview.js
import { action } from "@storybook/addon-actions"

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
// In Storybook it makes more sense to log an action than doing an actual navigate. Checkout the actions addon docs for more info: https://github.com/storybookjs/storybook/tree/master/addons/actions

window.___navigate = pathname => {
  action("NavigateTo:")(pathname)
}
```

## TypeScript Support

The Storybook v6 has [out-of-the-box support for TypeScript](https://storybook.js.org/docs/react/configure/typescript). The stories and components can be authored with `.tsx` extension

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

- For more information on Storybook, visit [the Storybook site](https://storybook.js.org/)
