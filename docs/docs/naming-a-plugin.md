---
title: Naming a Plugin
---

## Plugin title naming conventions

There are four standard plugin naming conventions for Gatsby:

- **`gatsby-source-*`** — a source plugin loads data from a given source (e.g. WordPress, MongoDB, the file system). Use this plugin type if you are connecting a new source of data to Gatsby.
  - Example: [`gatsby-source-contentful`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-contentful)
  - Docs: [creating a source plugin](/docs/creating-a-source-plugin/)
- **`gatsby-transformer-*`** — a transformer plugin converts data from one format (e.g. CSV, YAML) to a JavaScript object. Use this naming convention if your plugin will be transforming data from one format to another.
  - Example: [`gatsby-transformer-yaml`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-yaml)
  - Docs: [creating a transformer plugin](/docs/creating-a-transformer-plugin/)
- **`gatsby-[plugin-name]-*`** — if a plugin is a plugin for another plugin 😅, it should be prefixed with the name of the plugin it extends (e.g. if it adds emoji to the output of `gatsby-transformer-remark`, call it `gatsby-remark-add-emoji`). Use this naming convention whenever your plugin will be included as a plugin in the `options` object of another plugin.
  - Example: [`gatsby-remark-images`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-remark-images)
- **`gatsby-theme-*`** — this naming convention must be used for [Gatsby themes](/docs/themes/), which are a type of plugin.
- **`gatsby-plugin-*`** — this is the most general plugin type. Use this naming convention if your plugin doesn’t meet the requirements of any other plugin types.
  - Example: [`gatsby-plugin-sharp`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-sharp)
