---
title: Using a Plugin in Your Site
---

Gatsby plugins are Node.js packages, so you can install them like other packages in node using npm.

For example, `gatsby-transformer-json` is a package that adds support for JSON files to the Gatsby data layer.

To install it, in the root of your site you run:

```shell
npm install gatsby-transformer-json
```

Then in your site's `gatsby-config.js` you add `gatsby-transformer-json` to the plugins array like:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [`gatsby-transformer-json`],
}
```

Plugins can take options. For example:

```javascript:title=gatsby-config.js
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
