---
title: Plugins
---

Plugins are Node.js packages that implement Gatsby APIs. They enable you to
easily solve common website build problems e.g. setup Sass, add markdown
support, process images, etc.

For larger more complex sites, they let you modularize your site customizations
into site-specific plugins.

Gatsby has already a large and growing set of plugins. See below for the list
of official plugins. We'll eventually add support here for searching and browsing
both official plugins and community plugins published on NPM.

## How to use?

Plugins are just Node.js packages meaning you install them like anything else
in node using NPM.

For example, `gatsby-transformer-json` is a package which adds support for JSON
files to the Gatsby data layer.

To install it, in the root of your site you run:

`npm install --save gatsby-transformer-json`

Then in your site's `gatsby-config.js` you simply add `gatsby-transformer-json`
to the plugins array like:

```javascript
module.exports = {
  plugins: [
    `gatsby-transformer-json`,
  ],
}
```

Plugins can take options. See each plugin page below for more detailed documentation
on using each plugin.

## Locally defined plugins

When you want to work on a new plugin, or maybe write one that is only relevant
to your specific use-case, a locally defined plugin is more convinient than
having to create an NPM package for it.

You can place the code in the `plugins` folder in the root of your project like
this:

```
plugins
└── my-own-plugin
    ├── gatsby-node.js
    └── package.json
```

Each plugin requires a package.json file, but the minimum content is just an
empty object `{}`. The `name` and `version` fields are read from the package file.
The name is used to identify the plugin when it mutates the GraphQL data structure.
The version is used to clear the cache when it changes.

For local plugins it is best to leave the version field empty. Gatsby will
generate an md5-hash from all gatsby-* file contents and use that as the version.
This way the cache is automatically flushed when you change the code of your
plugin.

If the name is empty it is inferred from the plugin folder name.

Like all gatsby-* files, the code is not being processed by Babel. If you
want to use javascript syntax which isn't supported by your version of Node.js,
you can place the files in a `src` subfolder and build them to the plugin folder root.

## Official plugins

* [gatsby-plugin-catch-links](/docs/packages/gatsby-plugin-catch-links/)
* [gatsby-plugin-coffeescript](/docs/packages/gatsby-plugin-coffeescript/)
* [gatsby-plugin-feed](/docs/packages/gatsby-plugin-feed/)
* [gatsby-plugin-glamor](/docs/packages/gatsby-plugin-glamor/)
* [gatsby-plugin-google-analytics](/docs/packages/gatsby-plugin-google-analytics/)
* [gatsby-plugin-manifest](/docs/packages/gatsby-plugin-manifest/)
* [gatsby-plugin-nprogress](/docs/packages/gatsby-plugin-nprogress/)
* [gatsby-plugin-offline](/docs/packages/gatsby-plugin-offline/)
* [gatsby-plugin-preact](/docs/packages/gatsby-plugin-preact/)
* [gatsby-plugin-react-helmet](/docs/packages/gatsby-plugin-react-helmet/)
* [gatsby-plugin-sass](/docs/packages/gatsby-plugin-sass/)
* [gatsby-plugin-sharp](/docs/packages/gatsby-plugin-sharp/)
* [gatsby-plugin-styled-components](/docs/packages/gatsby-plugin-styled-components/)
* [gatsby-plugin-typescript](/docs/packages/gatsby-plugin-typescript/)
* [gatsby-remark-autolink-headers](/docs/packages/gatsby-remark-autolink-headers/)
* [gatsby-remark-copy-linked-files](/docs/packages/gatsby-remark-copy-linked-files/)
* [gatsby-remark-prismjs](/docs/packages/gatsby-remark-prismjs/)
* [gatsby-remark-responsive-iframe](/docs/packages/gatsby-remark-responsive-iframe/)
* [gatsby-remark-responsive-image](/docs/packages/gatsby-remark-responsive-image/)
* [gatsby-remark-smartypants](/docs/packages/gatsby-remark-smartypants/)
* [gatsby-sharp](/docs/packages/gatsby-sharp/)
* [gatsby-source-drupal](/docs/packages/gatsby-source-drupal/)
* [gatsby-source-filesystem](/docs/packages/gatsby-source-filesystem/)
* [gatsby-source-hacker-news](/docs/packages/gatsby-source-hacker-news/)
* [gatsby-transformer-documentationjs](/docs/packages/gatsby-transformer-documentationjs/)
* [gatsby-transformer-json](/docs/packages/gatsby-transformer-json/)
* [gatsby-transformer-remark](/docs/packages/gatsby-transformer-remark/)
* [gatsby-transformer-sharp](/docs/packages/gatsby-transformer-sharp/)
* [gatsby-transformer-yaml](/docs/packages/gatsby-transformer-yaml/)

## Official components

* [gatsby-link](/docs/packages/gatsby-link/)
