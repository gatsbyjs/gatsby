---
title: The gatsby-config.js API file
---

The file `gatsby-config.js` defines your site's metadata, plugins, and other general configuration. This file should be in the root of your Gatsby site.

If you created a gatsby site with the `gatsby new` command, there should already be a sample configuration file in your site's directory.

## Set up the configuration file

The configuration file should export a javascript object. Within this object you can define several different configuration options.

```javascript:title=gatsby-config.js
module.exports = {
  //configuration object
}
```

## Configuration options

There are many [different configuration options](/docs/gatsby-config) available, but this page will outline the most common ones.

### Site metadata

The `siteMetadata` object can contain any data you want to share across your site. A useful example is the site's title. If you store the title in `siteMetadata`, you can alter the title in one place, and it will be updated throughout your site. To add metadata, add a `siteMetadata` object to your configuration file:

```javascript:title=gatsby-config.js
module.exports = {
  siteMetadata: {
    title: `Gatsby`,
  },
}
```

You can then [access the title using GraphQL](/tutorial/part-four/#your-first-graphql-query) anywhere on your site.

### Plugins

Plugins add new features to your Gatsby site. For example, some plugins fetch data from hosted services, or let you use CSS libraries. The [Gatsby plugin library](/plugins) helps you find the right plugin for your needs.

Installing a plugin using a package manager like `yarn` or `npm` **does not** enable it in your Gatsby site. To finish adding a plugin, first make sure your `gatsby-config.js` file has a `plugins` array:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [
    //plugins go here
  ],
}
```

#### Plugins without options

If a plugin does not require any options, you can simply add it's name to the `plugins` array:

```javascript:title=gatsby-config.js
module.exports = {
  plugins: [`gatsby-plugin-name`],
}
```

#### Plugins with options

Many plugins have optional or required options to configure them. Instead of adding their name to the `plugins` array directly, add an object with their name and options. Most plugins show examples in their `README` file, or page in the Gatsby plugin library

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

## Additional configuration options

There are several more configuration options available for `gatsby-config.js`. You can find a list of every option in the [Gatsby Configuration API](/docs/gatsby-config/) page.
