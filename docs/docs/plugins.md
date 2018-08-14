---
title: Plugins
---

One of the best ways to add functionality to Gatsby is through our plugin system. Gatsby is designed to be extensible, which means plugins are able to extend and modify just about everything Gatsby does.

Of the many possibilities, plugins can:

- add external data or content (e.g. your CMS, static files, a REST API) to your Gatsby GraphQL data
- transform data from other formats (e.g. Markdown, YAML, CSV) to JSON objects
- add third-party services (e.g. Google Analytics, Instagram) to your site
- anything you can dream up!

Gatsby plugins are Node.js packages that implement Gatsby APIs. For larger, more complex sites, plugins let you modularize your site customizations into site-specific plugins.

## Search published plugins

Gatsby has a large and growing ecosystem of official and community plugins. To browse plugins and their documentation, visit the [Gatsby Plugin Library](/plugins/).

## Learn more about plugins

For documentation with further detail on what comprises a Gatsby plugin (file structure, etc), see the [plugin authoring page](/docs/plugin-authoring/).

## Build and publish a plugin

For a walkthrough of how to build and publish your own plugin, see the [source plugin tutorial](/docs/source-plugin-tutorial/).

## Use a plugin in your site

Gatsby plugins are Node.js packages, so you can install them like other packages in node using NPM.

For example, `gatsby-transformer-json` is a package which adds support for JSON files to the Gatsby data layer.

To install it, in the root of your site you run:

```bash
npm install --save gatsby-transformer-json
```

Then in your site's `gatsby-config.js` you add `gatsby-transformer-json` to the plugins array like:

```javascript
module.exports = {
  plugins: [`gatsby-transformer-json`],
}
```

Plugins can take options. For example:

```javascript
module.exports = {
  plugins: [
    // Shortcut for adding plugins without options.
    "gatsby-plugin-react-helmet",
    {
      // Standard plugin with options example
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/data/`,
        name: "data",
      },
    },
    {
      resolve: "gatsby-plugin-offline",
      // Blank options, equivalent to string-only plugin
      options: {
        plugins: [],
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        // plugins inside plugins
        plugins: [`gatsby-remark-smartypants`],
      },
    },
  ],
}
```

Note that plugin options will be stringified by Gatsby, so they cannot be functions.
