---
title: Configuring Plugin Usage with Plugin Options
---

Plugins loaded into a Gatsby site can have options passed in to customize how a plugin operates.

_This guide refers to creating plugins, if you are looking for general information on using options with plugins refer to ["Using a Plugin in Your Site"](/docs/using-a-plugin-in-your-site/). If you are looking for options of a specific plugin, refer to its README._

## Where to access plugin options

A Gatsby plugin with options included makes those options available in the second argument of Gatsby [Node](/docs/node-apis/), [Browser](/docs/browser-apis/), and [SSR APIs](/docs/ssr-apis/). Consider the following `gatsby-config` with a plugin called `gatsby-plugin-console-log`:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-console-log`,
      options: { optionA: true, optionB: false, message: "Hello world" },
    },
  ],
}
```

With the `optionA`, `optionB`, and `message` options passed into the plugin, the code for `gatsby-plugin-console-log` is able to access the values `true`, `false`, and `Hello world` by their keys.

For example, `gatsby-plugin-console-log` can access the `message` in order to log its value to the console inside of the `onPreInit` API:

```javascript:title=plugins/gatsby-plugin-console-log/gatsby-node.js
exports.onPreInit = (_, pluginOptions) => {
  console.log(
    `logging: "${pluginOptions.message || `default message`}" to the console` // highlight-line
  )
}
```

The code above is called when `gatsby develop` or `gatsby build` is run. It takes the `message` from the `options` object in the config and logs it from `pluginOptions.message` when the `onPreInit` method is called.

The second argument passed into the function is where the options are held.

_Like arguments in any JavaScript function, you can use a different (more specific) name like `themeOptions` if you are building a plugin that will be used as a theme._

## What can be passed in as options

Any JavaScript data type can be passed in as an option.

The following table lists possible options values and an example plugin that makes use of them.

| Data Type | Sample Value                     | Example Plugin                                                    |
| --------- | -------------------------------- | ----------------------------------------------------------------- |
| Boolean   | `true`                           | [`gatsby-plugin-sharp`](/packages/gatsby-plugin-sharp/)           |
| String    | `/src/data/`                     | [`gatsby-source-filesystem`](/packages/gatsby-source-filesystem/) |
| Array     | `["/about-us/", "/projects/*"]`  | [`gatsby-plugin-offline`](/packages/gatsby-plugin-offline/)       |
| Object    | `{ default: "./src/layout.js" }` | [`gatsby-plugin-mdx`](/packages/gatsby-plugin-mdx/)               |

**Note**: Themes (which are a type of plugin) are able to receive options from a site's `gatsby-config` to be used in its `gatsby-config` in order to allow themes to be composed together. This is done by exporting the `gatsby-config` as a function instead of an object. You can see an example of this in the [`gatsby-theme-blog`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-theme-blog) and [`gatsby-theme-blog-core`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-theme-blog-core) repositories. Plugins are not capable of this functionality.

## Additional resources

- [Example Gatsby site using plugin options with a local plugin](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-plugin-options)
