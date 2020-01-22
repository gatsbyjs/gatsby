---
title: Loading Plugins from Your Local Plugins Folder
---

Gatsby can load plugins from your website's local plugins folder, which is a folder named `plugins` in the website's root directory.

Consider this example Gatsby website's project structure, which includes a local plugin called `gatsby-local-plugin`:

```
/my-gatsby-site
└── /src
    └── /pages
    └── /components
<!-- highlight-start -->
└── /plugins
    └── /gatsby-local-plugin
        └── /package.json
        └── /gatsby-node.js
<!-- highlight-end -->
└── gatsby-config.js
└── gatsby-node.js
└── package.json
```

Like the name of the plugins folder implies, you can include multiple plugins in your local plugin folder.

Including a local plugin in your plugins folder also requires a configuration step (just like a 3rd party plugin you've installed into your `node_modules` by running `npm install`); just as plugins installed from npm need to be included in your `gatsby-config`, you need to add the name of your local plugin to the plugins array as well:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-third-party-plugin`,
    `gatsby-local-plugin`, // highlight-line
  ],
}
```

## Verifying your plugin is loading

To verify that your plugin is actually being found, you could add a small snippet of code like this to a `gatsby-node.js` file in the root of your plugin:

```javascript:title=plugins/gatsby-local-plugin/gatsby-node.js
exports.onPreInit = () => {
  console.log("Testing...")
}
```

_The [`onPreInit` API](/docs/node-apis/#onPreInit) is the first Node API called by Gatsby right after plugins are loaded._

Then, when running your site in develop or build, you should see "Testing..." logged inside Gatsby's output in the console:

```sh
success open and validate gatsby-configs - 0.051s
success load plugins - 1.047s
Testing... // highlight-line
success onPreInit - 0.023s
...
```

## Loading local plugins from _outside_ the plugins folder

If you want to reference a plugin that is not in the plugins folder then you can use the built in Node.js `require.resolve` to pull in a plugin from another location. This can be helpful for developing a plugin yourself, or contributing to an existing plugin.

This process is described in more detail in the [Creating a Local Plugin guide](/docs/creating-a-local-plugin/).
