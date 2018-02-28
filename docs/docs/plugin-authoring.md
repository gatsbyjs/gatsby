---
title: Plugin Authoring
---

Creating custom plugins in Gatsby is a breeze with our straightforward authoring process.

## Core Concepts

- Every Gatsby plugin is a standalone npm package
- At minimum, a `package.json` is required
- Plugins can be used locally (see [local plugins](#local-plugins) below) or published to npm as packages
- A plugin has access to the the Gatsby [Node](/docs/node-apis/), [SSR](/docs/ssr-apis/), and [browser](/docs/browser-apis/) APIs

## Plugin naming conventions

There are four standard plugin naming conventions for Gatsby:

- **`gatsby-source-*`** — a source plugin loads data from a given source (e.g. WordPress, MongoDB, the file system). Use this plugin type if you are connecting a new source of data to Gatsby.
  - Example: `gatsby-source-contentful`
  - Docs: [create a source plugin](/docs/create-source-plugin/)
- **`gatsby-transformer-*`** — a transformer plugin converts data from one format to another (e.g. CSV to JSON). Use this naming convention
  - Example: `gatsby-transformer-yaml`
- **`gatsby-[plugin-name]-*`** — if a plugin is a plugin for another plugin 😅, it should be prefixed with the name of the plugin it extends (e.g. if it adds emoji to the output of `gatsby-transformer-remark`, call it `gatsby-remark-add-emoji`). Use this naming convention whenever your plugin will be included as a plugin in the `options` object of another plugin.
  - Example: `gatsby-remark-images`
- **`gatsby-plugin-*`** — this is the most general plugin type. Use this naming convention if your plugin doesn’t meet the requirements of any other plugin types.
  - Example: `gatsby-plugin-sass`

## What files does Gatsby look for in a plugin?

All files are optional unless specifically marked as required.

- `package.json` — [required] this can be an empty object (`{}`) for local plugins
    - `name` is used to identify the plugin when it mutates Gatsby’s GraphQL data structure
        - if `name` isn’t set, the folder name for the plugin is used
    - `version` is used to manage the cache — if it changes, the cache is cleared
        - if `version` isn’t set, an MD5 hash of the `gatsby-*` file contents is used to invalidate the cache
        - omitting the `version` field is recommended for local plugins
- `gatsby-browser.js` — usage details are in the [browser API reference](/docs/browser-apis/)
- `gatsby-node.js` — usage details are in the [Node API reference](/docs/node-apis/)
- `gatsby-ssr.js` — usage details are in the [SSR API reference](/docs/ssr-apis/)

## Local plugins

When you want to work on a new plugin, or maybe write one that is only relevant
to your specific use-case, a locally defined plugin is more convenient than
having to create an NPM package for it.

You can place the code in the `plugins` folder in the root of your project like
this:

```
plugins
└── my-own-plugin
    └── package.json
```

**NOTE:** You still need to add the plugin to your `gatsby-config.js`. There is no auto-detection of local plugins.

Like all `gatsby-*` files, the code is not being processed by Babel. If you want
to use JavaScript syntax which isn't supported by your version of Node.js, you
can place the files in a `src` subfolder and build them to the plugin folder
root.
