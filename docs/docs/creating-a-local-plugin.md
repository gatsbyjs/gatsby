---
title: Creating a Local Plugin
---

If a plugin is only relevant to your specific use-case, or if you’re developing a plugin and want a simpler workflow, a locally defined plugin is a convenient way to create and manage your plugin code.

Place the code in the `plugins` folder in the root of your project like this:

```text
plugins
└── my-own-plugin
    └── package.json
```

**NOTE:** You still need to add the plugin to your `gatsby-config.js`. There is no auto-detection of local plugins.

**NOTE:** For the plugin to be discovered, the plugin's root folder name is the value that needs to be referenced in order to load it (_not_ its _name_ in its package.json file). For example, in the above structure, the correct way to load the plugin is:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: ["my-own-plugin"],
}
```

Like all `gatsby-*` files, the code is not processed by Babel. If you want
to use JavaScript syntax which isn't supported by your version of Node.js, you
can place the files in a `src` subfolder and build them to the plugin folder
root.
