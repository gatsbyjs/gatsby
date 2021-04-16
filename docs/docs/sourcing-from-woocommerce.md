---
title: Sourcing from WooCommerce
---

WooCommerce is the e-commerce platform for WordPress. This guide will serve as a helpful reference whether you’re interested in getting started with e-commerce for your WordPress site or beginning to use Gatsby with your current WooCommerce setup.

## Prerequisites

This guide assumes some familiarity with WordPress. You may want to read about [Sourcing from WordPress](/docs/how-to/sourcing-data/sourcing-from-wordpress/) or step through a [tutorial on how to build a blog with WordPress and Gatsby](/blog/2019-04-26-how-to-build-a-blog-with-wordpress-and-gatsby-part-1) before diving in.

You’ll need a WordPress site with the [WooCommerce](https://woocommerce.com/) plugin installed and activated.

## Existing plugins

This guide assumes the use of the [`gatsby-source-woocommerce` plugin](/plugins/@pasdo501/gatsby-source-woocommerce/).

Install it:

```shell
npm install @pasdo501/gatsby-source-woocommerce
```

Configure its options:

```js:title=gatsby-config.js
{
  resolve: "@pasdo501/gatsby-source-woocommerce",
  options: {
    // Base URL of WordPress site
    api: 'wordpress.domain',
    // true if using https. false otherwise.
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

The `consumer_key` and `consumer_secret` come from WooCommerce. From your dashboard, go to WooCommerce > Settings > Advanced > REST API and then add a key. You can then copy and paste both the key and secret. Make sure to store any sensitive information in [environment variables](/docs/how-to/local-development/environment-variables/)!

It's worth noting that the official WordPress source plugin is in active development. Knowing that this work is in-progress, if you're interested in working with a GraphQL endpoint directly in your WordPress installation, see the section below on [pending changes](#pending-changes) to get started with WPGraphQL and WooCommerce.

## Adding products

WooCommerce products are the core of your WooCommerce site, so you’ll want to add some to your store. When you’re first getting started, there’s no need to dump absolutely everything you want to sell into your store. Begin with a few products that you can use to verify that everything is hooked up correctly. You can also [import products from a CSV file](https://docs.woocommerce.com/document/product-csv-importer-exporter/).

You should see a prompt to create your first product after completing the WooCommerce setup wizard. Doing so at this time will trigger a guided tour of the new product form. Walk through this process for each product you'd like to add to your store.

Once this is done, you’ll be able to use GraphQL to query for your products by adding this query to the appropriate component:

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

You can explore the data available to your site [using GraphiQL](/docs/how-to/querying-data/running-queries-with-graphiql/). This is dependent on the fields you have specified in `gatsby-config.js`. The plugin documentation has tons of [suggested GraphQL queries](/plugins/@pasdo501/gatsby-source-woocommerce/#some-graphql-query-examples). If you don't see the options listed there, try adjusting the `fields` array and/or refreshing your GraphiQL tab.

### Using WPGraphQL

You can explore possible queries in the [WPGraphQL WooCommerce Playground](https://docs.wpgraphql.com/extensions/wpgraphql-woocommerce/#playground). Note that some queries are only available to shop managers as opposed to customers.

## Pending Changes

Note that `gatsby-source-wordpress` is undergoing a major rewrite at the time of writing. This new major version of the official source plugin is likely to change the optimal solution for using WooCommerce with Gatsby. For now, new projects should start with [`gatsby-source-graphql`](/plugins/gatsby-source-graphql/) rather than `gatsby-source-wordpress` to ease the transition. If you’re interested in the current progress of the plugin, you can [check out the working alpha version](https://github.com/gatsbyjs/gatsby/issues/19292#issuecomment-587946239). **Once this work is done, the [`wp-graphql-woocommerce` plugin](https://github.com/wp-graphql/wp-graphql-woocommerce) will be the recommended option.**

If you decide to go with this more experimental route, you'll need to install and activate the [WPGraphQL](https://www.wpgraphql.com/) and [wp-graphql-woocommerce](https://github.com/wp-graphql/wp-graphql-woocommerce) plugins on your WordPress site as well.

The WPGraphQL plugin is also undergoing significant changes. It has not yet hit v1 and may therefore introduce [breaking changes](https://docs.wpgraphql.com/getting-started/install-and-activate/#breaking-change-notice) as it continues to progress through development. It can be used in production but keep this in mind when using the plugin!

## Other resources

- [`gatsby-source-woocommerce`](/plugins/@pasdo501/gatsby-source-woocommerce/)
- [`gatsby-theme-woocommerce`](/plugins/@ccerda0520/gatsby-theme-woocommerce/)
- [`wp-graphql-woocommerce` plugin](https://github.com/wp-graphql/wp-graphql-woocommerce)
- [`gatsby-source-wordpress` starter](https://github.com/gatsbyjs/gatsby/blob/master/starters/gatsby-starter-wordpress-blog)
- [Sourcing from WordPress](/docs/how-to/sourcing-data/sourcing-from-wordpress/)
