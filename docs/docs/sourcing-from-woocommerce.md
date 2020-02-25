---
title: Sourcing from WooCommerce
---

WooCommerce is the e-commerce platform for WordPress. This guide will serve as a helpful reference whether you’re interested in getting started with e-commerce for your WordPress site or beginning to use Gatsby with your current WooCommerce setup.

## Prerequisites

This guide assumes some familiarity with WordPress. You may want to read about [Sourcing from WordPress](/docs/sourcing-from-wordpress/) or step through a [tutorial on how to build a blog with WordPress and Gatsby](/blog/2019-04-26-how-to-build-a-blog-with-wordpress-and-gatsby-part-1) before diving in.

You’ll need a WordPress site with the [WooCommerce](https://woocommerce.com/) plugin installed and activated.

## Existing plugins

This guide assumes the use of the [`gatsby-source-woocommerce` plugin](/packages/@pasdo501/gatsby-source-woocommerce/). It is a stable, straightforward solution specific to WooCommerce. You can install it with `npm install --save @pasdo501/gatsby-source-woocommerce` and then configure its options:

```js:title=gatsby-config.js
{       
  resolve: "@pasdo501/gatsby-source-woocommerce",
  options: {
    // Base URL of Wordpress site
    api: 'wordpress.domain',
    // true if using https. false if nah.
    https: false,
    api_keys: {
      consumer_key: `your key`,
      consumer_secret: `your secret`,
    },
    // Array of strings with fields you'd like to create nodes for...
    fields: ['products', 'products/categories', 'products/attributes'],
  }
},
```

However, there are other options which may make more sense for your project. For example, you may want to source more general site data like posts and pages from WordPress as well.

### Pending Changes

Note that `gatsby-source-wordpress` is undergoing a major rewrite at the time of writing. This new major version of the official source plugin is likely to change the optimal solution for using WooCommerce with Gatsby. For now, new projects should start with [`gatsby-source-graphql`](/packages/gatsby-source-graphql/) rather than `gatsby-source-wordpress` to ease the transition. If you’re interested in the current progress of the plugin, you can [check out the working alpha version](https://github.com/gatsbyjs/gatsby/issues/19292#issuecomment-587946239). **Once this work is done, the [`wp-graphql-woocommerce` plugin](https://github.com/wp-graphql/wp-graphql-woocommerce) will be the recommended option.**

If you decide to go with this more experimental route, you'll need to install and activate the [WPGraphQL](https://www.wpgraphql.com/) and [wp-graphql-woocommerce](https://github.com/wp-graphql/wp-graphql-woocommerce) plugins on your WordPress site as well.

The WPGraphQL plugin is also undergoing significant changes. It has not yet hit v1 and may therefore introduce [breaking changes](https://docs.wpgraphql.com/getting-started/install-and-activate/#breaking-change-notice) as it continues to progress through development. It can be used in production but keep this in mind when using the plugin!

## Adding products

WooCommerce products are the core of your WooCommerce site, so you’ll want to add some to your store. When you’re first getting started, there’s no need to dump absolutely everything you want to sell into your store. Begin with a few products that you can use to verify that everything is hooked up correctly. You can also [import products from a CSV file](https://docs.woocommerce.com/document/product-csv-importer-exporter/). You should see as prompt to create your first product after completing the WooCommerce setup wizard. 

Once this is done, you’ll be able to use GraphQL to query for your products:

```graphql
allWcProducts {
  edges {
    node {
      name
      price
    }
  }
}
```

## Testing queries

### Using GraphiQL

You can explore the data available to your site [using GraphiQL](/docs/running-queries-with-graphiql/). This is dependent on the fields you have specified in `gatsby-config.js`. The plugin documentation has tons of [suggested GraphQL queries](/packages/@pasdo501/gatsby-source-woocommerce/#some-graphql-query-examples). If you don't see the options listed there, try adjusting the `fields` array and/or refreshing your GraphiQL tab.

### Using WPGraphQL

You can explore possible queries in the [WPGraphQL WooCommerce Playground](https://docs.wpgraphql.com/extensions/wpgraphql-woocommerce/#playground). Note that some queries are only available to shop managers as opposed to customers.

## Other resources

- [`gatsby-source-woocommerce`](/packages/@pasdo501/gatsby-source-woocommerce/)
- [`gatsby-theme-woocommerce`](/packages/@ccerda0520/gatsby-theme-woocommerce/)
- [`wp-graphql-woocommerce` plugin](https://github.com/wp-graphql/wp-graphql-woocommerce)
- [experimental `gatsby-source-wordpress` starter](https://github.com/TylerBarnes/using-gatsby-source-wordpress-experimental)
- [Sourcing from WordPress](/docs/sourcing-from-wordpress/)
