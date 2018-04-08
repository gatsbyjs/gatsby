---
title: Plugins
---

Plugins are Node.js packages that implement Gatsby APIs. They enable you to
easily solve common website build problems e.g. setup Sass, add markdown
support, process images, etc.

For larger / complex sites, they let you modularize your site customizations
into site-specific plugins.

Gatsby has a large and growing set of plugins. To search/browse official and
community plugins and their documentation, visit the [Plugin Library](/packages/).

For information on building your own plugin, see the [Plugin Authoring page](/docs/plugin-authoring/).

## How to use Gatsby plugins?

Gatsby plugins are just Node.js packages meaning you install them like anything else in
node using NPM.

For example, `gatsby-transformer-json` is a package which adds support for JSON
files to the Gatsby data layer.

To install it, in the root of your site you run:

`npm install --save gatsby-transformer-json`

Then in your site's `gatsby-config.js` you add `gatsby-transformer-json`
to the plugins array like:

```javascript
module.exports = {
  plugins: [`gatsby-transformer-json`],
};
```

Plugins can take options. Note that plugin options will be stringified by Gatsby, so they cannot be functions.
