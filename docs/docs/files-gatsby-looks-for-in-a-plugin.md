---
title: Files Gatsby Looks for in a Plugin
---

## What files does Gatsby look for in a plugin?

All files are optional unless specifically marked as required.

- `package.json` — [required] this can be an empty object (`{}`) for local plugins
  - `name` is used to identify the plugin when it mutates Gatsby’s GraphQL data structure
    - if `name` isn’t set, the folder name for the plugin is used
  - `version` is used to manage the cache — if it changes, the cache is cleared
    - if `version` isn’t set, an MD5 hash of the `gatsby-*` file contents is used to invalidate the cache
    - omitting the `version` field is recommended for local plugins
  - `keywords` is used to make your plugin discoverable
    - plugins published on the npm registry should have `gatsby` and `gatsby-plugin` in the `keywords` field to be added to the [Plugin Library](/packages/)
- `gatsby-browser.js` — usage details are in the [browser API reference](/docs/browser-apis/)
- `gatsby-node.js` — usage details are in the [Node API reference](/docs/node-apis/)
- `gatsby-ssr.js` — usage details are in the [SSR API reference](/docs/ssr-apis/)
