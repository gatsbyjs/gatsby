---
title: Plugin Authoring
---

One of the best ways to add functionality to Gatsby is through our plugin system. Gatsby is designed to be extensible, which means plugins are able to extend and modify just about everything Gatsby does.

Of the many possibilities, plugins can:

- add external data or content (e.g. your CMS, static files, a REST API) to your Gatsby GraphQL data
- transform data from other formats (e.g. YAML, CSV) to JSON objects
- add third-party services (e.g. Google Analytics, Instagram) to your site
- anything you can dream up!

## Core Concepts

- Each Gatsby plugin can be created as an npm package or as a [local plugin](#local-plugins)
- A `package.json` is required
- Plugin implement the Gatsby APIs for [Node](/docs/node-apis/), [server-side rendering](/docs/ssr-apis/), and the [browser](/docs/browser-apis/)

## Plugin naming conventions

There are four standard plugin naming conventions for Gatsby:

- **`gatsby-source-*`** — a source plugin loads data from a given source (e.g. WordPress, MongoDB, the file system). Use this plugin type if you are connecting a new source of data to Gatsby.
  - Example: [`gatsby-source-contentful`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-contentful)
  - Docs: [create a source plugin](/docs/create-source-plugin/)
- **`gatsby-transformer-*`** — a transformer plugin converts data from one format (e.g. CSV, YAML) to a JavaScript object. Use this naming convention if your plugin will be transforming data from one format to another.
  - Example: [`gatsby-transformer-yaml`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-yaml)
- **`gatsby-[plugin-name]-*`** — if a plugin is a plugin for another plugin 😅, it should be prefixed with the name of the plugin it extends (e.g. if it adds emoji to the output of `gatsby-transformer-remark`, call it `gatsby-remark-add-emoji`). Use this naming convention whenever your plugin will be included as a plugin in the `options` object of another plugin.
  - Example: [`gatsby-remark-images`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-images)
- **`gatsby-plugin-*`** — this is the most general plugin type. Use this naming convention if your plugin doesn’t meet the requirements of any other plugin types.
  - Example: [`gatsby-plugin-sharp`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-sharp)

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

If a plugin is only relevant to your specific use-case, or if you’re developing a plugin and want a simpler workflow, a locally defined plugin is a convenient way to create and manage your plugin code.

Place the code in the `plugins` folder in the root of your project like this:

```
plugins
└── my-own-plugin
    └── package.json
```

**NOTE:** You still need to add the plugin to your `gatsby-config.js`. There is no auto-detection of local plugins.

Like all `gatsby-*` files, the code is not processed by Babel. If you want
to use JavaScript syntax which isn't supported by your version of Node.js, you
can place the files in a `src` subfolder and build them to the plugin folder
root.
