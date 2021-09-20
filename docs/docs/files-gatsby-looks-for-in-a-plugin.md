---
title: Files Gatsby Looks for in a Plugin
---

## What files does Gatsby look for in a plugin?

All files are optional unless specifically marked as required.

- `package.json` — [required] this can be an empty object (`{}`) for local plugins.
  - `name` is used to identify the plugin when it mutates Gatsby’s GraphQL data structure
    - if `name` isn’t set, the folder name for the plugin is used
  - `main` is the [name of the file that will be loaded when your module is required by another application](https://docs.npmjs.com/creating-node-js-modules#create-the-file-that-will-be-loaded-when-your-module-is-required-by-another-application)
    - if `main` isn’t set, a default name of `index.js` will be used
    - if `main` isn't set, it is recommended (but not required) to create an empty index.js file with the contents `//no-op` (short for no-operation), as seen in this [example plugin](https://github.com/gatsbyjs/gatsby/tree/817a6c14543c73ea8f56c9f93d401b03adb44e9d/packages/gatsby-source-wikipedia)
  - `version` is used to manage the cache — if it changes, the cache is cleared
    - if `version` isn’t set, an MD5 hash of the `gatsby-*` file contents is used to invalidate the cache
    - omitting the `version` field is recommended for local plugins
  - `keywords` is used to make your plugin discoverable
    - plugins published on the npm registry should have `gatsby` and `gatsby-plugin` in the `keywords` field to be added to the [Plugin Library](/plugins/)
- `gatsby-browser.js` — usage details are in the [browser API reference](/docs/reference/config-files/gatsby-browser/)
- `gatsby-node.js` — usage details are in the [Node API reference](/docs/reference/config-files/gatsby-node/)
- `gatsby-ssr.js` — usage details are in the [SSR API reference](/docs/reference/config-files/gatsby-ssr/)
