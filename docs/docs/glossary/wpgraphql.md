---
title: WPGraphQL
disableTableOfContents: true
---

Learn what WPGraphQL is and how to use it with Gatsby and WordPress.

## What is WPGraphQL?

[WPGraphQL](https://www.wpgraphql.com/) is a WordPress plugin that adds a [GraphQL](/docs/graphql/) API to your WordPress site. [GraphQL](/docs/glossary/graphql/) is a query language for requesting information from an [API](/docs/glossary#api) and a protocol for servers that support it. Gatsby [uses GraphQL](/docs/why-gatsby-uses-graphql/) to serve page data. Adding the WPGraphQL plugin to WordPress lets you use GraphQL to retrieve the specific pieces of content that you need to display on a Gatsby page.

### Installing WPGraphQL

You can install WPGraphQL using WordPress' _Add Plugins_ screen. You may also want to install the [WPGraphiQL](https://github.com/wp-graphql/wp-graphiql) plugin. WPGraphiQL turns the [GraphiQL IDE](/docs/how-to/querying-data/running-queries-with-graphiql/) (or integrated development environment) into a WordPress plugin. You do not have to install WPGraphiQL, but it helps you explore data and create queries from WordPress' administration interface.

1. Download [WPGraphQL](https://github.com/wp-graphql/wp-graphql) and [WPGraphiQL](https://github.com/wp-graphql/wp-graphiql) as ZIP archives from their respective GitHub repositories.
2. Upload `wp-graphql-develop.zip` and `wp-graphiql-master.zip`using the _Upload Plugin_ button on the _Add Plugins_ screen. You'll have to upload and install them one at a time.

WPGraphQL and WPGraphiQL are also available from the [Packagist](https://packagist.org/) repository. You can install them using [Composer](https://getcomposer.org/), a package manager for PHP.

```shell
composer require wp-graphql/wp-graphql wp-graphql/wp-graphiql
```

After installing WPGraphQL and WPGraphiQL, you'll need to activate them. If you've used the upload method, WordPress will display an _Activate Plugin_ button on the confirmation screen once the installation process completes. You can also activate (or deactivate) WPGraphQL and WPGraphiQL from the _Plugins_ screen.

Once activated, you may need to update your permalink structure. WPGraphQL requires [pretty permalinks](https://wordpress.org/support/article/using-permalinks/#mod_rewrite-pretty-permalinks), and a custom permalink structure.

Verify that WPGraphQL is working correctly by visiting the `/graphql` endpoint, relative to your WordPress home URL. If, for example, your WordPress home URL is `https://www.example.com/blog/`, the GraphQL endpoint will be `https://www.example.com/blog/graphql`.

> **NOTE:** If you are using the `WP_SITEURL` and `WP_HOME` WordPress constants, WPGraphQL will use the value of `WP_HOME`.

Then you can configure Gatsby to work with your new endpoint.

### Using WPGraphQL with Gatsby

We recommend using the official [gatsby-source-wordpress](/plugins/gatsby-source-wordpress/) plugin, which sources data from the WPGraphQL plugin.

You'll need to do two more things before you can use your WordPress-backed GraphQL server with Gatsby:

1. Install the [gatsby-source-wordpress](/plugins/gatsby-source-wordpress/) plugin; and
2. Update `gatsby-config.js`.

Use [npm](/docs/glossary#npm) to install [gatsby-source-wordpress](/plugins/gatsby-source-wordpress/).

```shell
npm install gatsby-source-wordpress
```

Then update `gatsby-config.js`. Specify the URL of the WPGraphQL endpoint and set other [configuration options](/plugins/gatsby-source-wordpress/).

```javascript
module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-wordpress",
      options: {
        url:
          process.env.WPGRAPHQL_URL ||
          `https://path-to-your-wordpress-instance.com/graphql`,
      },
    },
  ],
}
```

Be sure to restart the development server after making these changes. Now you can use your WordPress [GraphQL API with Gatsby](/docs/graphql/) just as you would any other GraphQL source.

WPGraphQL is one way to use Gatsby and WordPress together. It adds a flexible GraphQL API to the robust content management features of WordPress.

### Learn more about WPGraphQL

- [WPGraphQL](https://www.wpgraphql.com/) official site
- [Using Gatsby with WPGraphQL](https://www.youtube.com/watch?v=DH7I1xRrbxs) demo by the founder
- [What is GraphQL?](/docs/glossary/graphql/) from the Gatsby docs
- [Why Gatsby Uses GraphQL](/docs/why-gatsby-uses-graphql/)
