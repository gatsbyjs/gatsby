---
title: The gatsby-config.js API File
---

The file `gatsby-config.js` defines your site's metadata, plugins, and other general configuration. This file should be in the root of your Gatsby site.

If you created a Gatsby site with the `gatsby new` command, there should already be a sample configuration file in your site's directory.

## Set up the configuration file

The configuration file should export a JavaScript object. Within this object, you can define several different configuration options.

```javascript:title=gatsby-config.js
module.exports = {
  //configuration object
}
```

An example `gatsby-config.js` file could look like this:

```javascript:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `Gatsby`,
  },
  plugins: [
    `gatsby-transform-plugin`,
    {
      resolve: `gatsby-plugin-name`,
      options: {
        optionA: true,
        optionB: `Another option`,
      },
    },
  ],
}
```

## Configuration options

There are [many configuration options](/docs/gatsby-config) available, but the most common set site-wide metadata and enable plugins.

### Site metadata

The `siteMetadata` object can contain any data you want to share across your site. A useful example is the site's title. If you store the title in `siteMetadata`, you can alter the title in one place, and it will be updated throughout your site. To add metadata, include a `siteMetadata` object in your configuration file:

```javascript:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `Gatsby`,
  },
}
```

You can then [access the site title using GraphQL](/tutorial/part-four/#your-first-graphql-query) anywhere on your site.

### Plugins

Plugins add new features to your Gatsby site. For example, some plugins fetch data from hosted services, transform data formats, or resize images. The [Gatsby plugin library](/plugins) helps you find the right plugin for your needs.

Installing a plugin using a package manager like `npm` **does not** enable it in your Gatsby site. To finish adding a plugin, make sure your `gatsby-config.js` file has a `plugins` array so you can include a space for the plugins needed to build your site:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    //plugins go here
  ],
}
```

When adding multiple plugins, they should be separated by commas in the `plugins` array to support valid JavaScript syntax.

#### Plugins without options

If a plugin does not require any options, you can add its name as a string to the `plugins` array:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [`gatsby-plugin-name`],
}
```

#### Plugins with options

Many plugins have optional or required options to configure them. Instead of adding a name string to the `plugins` array, add an object with its name and options. Most plugins show examples in their `README` file or page in the [Gatsby plugin library](/plugins).

Here's an example showing how to write an object with keys to `resolve` the plugin name and an `options` object with any applicable settings:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-name`,
      options: {
        optionA: true,
        optionB: `Another option`,
      },
    },
  ],
}
```

#### Mixed plugins

You can add plugins with and without options in the same array. Your site's config file could look like this:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    `gatsby-transform-plugin`,
    {
      resolve: `gatsby-plugin-name`,
      options: {
        optionA: true,
        optionB: `Another option`,
      },
    },
  ],
}
```

## Additional configuration options

There are several more configuration options available for `gatsby-config.js`. You can find a list of every option in the [Gatsby Configuration API](/docs/gatsby-config/) page.
