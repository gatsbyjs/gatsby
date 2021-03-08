# Security

This plugin is built with your WP site security in mind. For that reason, we've intentionally left out any authentication options. The reason is that any data fetched by Gatsby should be considered public data. Any Gatsby site may potentially have a publically queryable GraphQL server running when Gatsby is running in Preview mode (either via self-hosted Preview or on Gatsby Cloud). If we were to source data from WordPress while authenticated, all of the data we sourced would be available in Gatsby, which means it could easily be leaked to anyone who happens upon your Preview instance. For this reason, auth options have been intentionally excluded.

If you have a requirement where you need some private data in Gatsby, you should either

1. If your private data requirements are related to specific user accounts and will require different data depending on who's logged in to your site, add client-side authentication and make live GraphQL requests to WPGraphQL in-browser (using [Apollo](https://www.apollographql.com/docs/react/) or similar).
2. Filter your data to be public in WPGraphQL. If you need some data during a Gatsby build, you need to consider it as public data. This means you need to make it public in WPGraphQL. Think very carefully before you do this, and make sure you understand the security implications before you change anything. To filter private data to make it public, visit the [WPGraphQL docs](https://www.wpgraphql.com/recipes/making-menus-and-menu-items-public/) to learn more.

:point_left: [Back to Features](./index.md)
