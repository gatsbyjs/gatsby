---
title: Creating a Local Plugin
---

If a plugin is only relevant to your specific use-case, or if you’re developing a plugin and want a simpler workflow, a locally defined plugin is a convenient way to create and manage your plugin code.

## Project structure for a local plugin

Place the code in the `plugins` folder in the root of your project like this:

```
/my-gatsby-site
└── gatsby-config.js
└── /src
└── /plugins
    └── /my-own-plugin
        └── package.json
```

The plugin also needs to be added to your `gatsby-config.js`, because there is no auto-detection of plugins. It can be added alongside any other 3rd party Gatsby plugins already included in your config.

For the plugin to be discovered when you run `gatsby develop`, the plugin's root folder name needs to match the name used in the `gatsby-config.js` (_not_ its _name_ in its `package.json` file). For example, in the above structure, the correct way to load the plugin is:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-third-party-plugin`,
    `my-own-plugin`, // highlight-line
  ],
}
```

Then your plugin can begin to hook into Gatsby through Node and SSR APIs.

## Developing a local plugin that is outside your project

Your plugin doesn't have to be in your project in order to be tested or worked on. If you'd like to [decouple](/docs/glossary#decoupled) your plugin from your site so it can be published as its own package, or you'd like to test or develop a forked version of a community authored plugin, you can follow one of the methods described below.

### Using `require.resolve` and a filepath

In addition to including a plugin the in `plugins` folder, you can give the path to a plugin included in a different location on your machine and `require` it.

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-plugin-react-helmet`,
    // highlight-start
    {
      // including a plugin from outside the plugins folder needs the path to it
      resolve: require.resolve(`../path/to/gatsby-local-plugin`),
    },
    // highlight-end
  ],
}
```

### Using `npm link` or `yarn link`

You can use [`npm link`](https://docs.npmjs.com/cli/link.html) or [`yarn link`](https://yarnpkg.com/lang/en/docs/cli/link/) to reference a package from another location on your machine in another project.

This is a similar process to setting up yarn workspaces for development with Gatsby themes (which is the recommended approach for developing themes). You can read how to setup a site in this manner in the [Building a Theme guide](/tutorial/building-a-theme/#set-up-yarn-workspaces).

**Note**: you can see an example for using a local plugin from the plugins folder, with `require.resolve`, and `npm link` demonstrated in [this example repository](https://github.com/gillkyle/local-plugins-in-gatsby).

## Compilation and processing steps

Like all `gatsby-*` files, the code is not processed by Babel. If you want
to use JavaScript syntax which isn't supported by your version of Node.js, you
can place the files in a `src` subfolder and build them to the plugin folder
root.
