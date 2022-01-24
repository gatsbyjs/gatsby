# Migrating from Other WP Source Plugins :bird:

From what we've seen migrating is a fairly painless process as the GraphQL schema structure is not too different from older Gatsby WordPress source plugins.

## Migrating from `gatsby-source-wordpress@v3`

**Note**: If you're using Gatsby Cloud and you have `gatsby-source-wordpress@v3` and `gatsby-source-wordpress` installed in the same site, only the experimental plugin will receive webhook updates when updating content.

[Graphiql](https://www.gatsbyjs.com/docs/running-queries-with-graphiql/) is your best friend when migrating from the last major version of this plugin. Run `gatsby develop` and visit `http://localhost:8000/___graphiql`

Any node list queries such as `allWordpressPage { nodes { title } }` will need to be updated to match the new WordPress types in the Gatsby schema. The new pattern for type names is `Wp` and then the capitalized type such as `Page`. So to replace the node list query above, you would write `allWpPage { nodes { title } }`.

Since `v3` used the WP REST API and `v4` uses WPGraphQL, the data shape and available fields for each type will vary. For example `featured_image` in `v3` becomes `featuredImage` in `v4`. Many of the core WordPress data fields remain the same, but if you're using any custom data, or fields added by extensions to access additional data (like ACF fields), you will need to use Graphiql to determine what the new data shape will be. If you find you're missing data, you may need to install a [WPGraphQL extension](https://docs.wpgraphql.com/extensions/wpgraphql-advanced-custom-fields/) to add that data to the schema. In most cases you will find that you have access to more data than before! But commonly, the [WPGraphQL ACF extension](https://docs.wpgraphql.com/extensions/wpgraphql-advanced-custom-fields/) will need to be installed.

If you have any custom code which you've added to make connections between nodes work in `v3`, you will get to delete that code (yay!) because WPGraphQL has excellent support built in for connection fields between nodes (for example `Page.author` or `User.pages`).

## Migrating from `gatsby-source-wordpress-experimental`

This is the easiest migration since both plugins are one and the same (as of `gatsby-source-wordpress@4.0.0`).

- Uninstall the experimental plugin `npm uninstall gatsby-source-wordpress-experimental`
- Install the stable plugin `npm install gatsby-source-wordpress`
- Then update `gatsby-config.js` to remove `-experimental` from the plugin name.

## Migrating from `gatsby-source-graphql`

You're in luck! :four_leaf_clover: This will likely be a very easy migration!

`gatsby-source-graphql` works in a very similar way to this plugin. What that means is your GraphQL queries will be nearly identical.

You will need to remove the `wp` root field which wraps around your `gatsby-source-graphql` queries. You will also need to modify the names of fields you're querying to get access to WordPress nodes.

For example, if you're querying for a list of pages:

```js
{
  wp {
    pages {
      nodes {
        title
      }
    }
  }
}
```

You can modify your query so that the root field is in this pattern: `allWp[fieldTypename]` and the `wp` wrapper is removed.

So your query would change to look like this:

```
{
  allWpPage {
    nodes {
      title
    }
  }
}
```

### `gatsby-source-graphql` and inline fragments

Any inline fragments will need to be updated since type names have changed. Use Gatsby's [Graphiql](https://www.gatsbyjs.com/docs/running-queries-with-graphiql/) at `http://localhost:8000/___graphiql` with `gatsby develop` running to determine how your inline fragment typenames should be modified.

### `gatsby-source-graphql` and `gatsby-plugin-image`

If you're using any plugins or additional schema customization code to enable the use of `gatsby-plugin-image`, you can delete that code and uninstall those plugins. `gatsby-source-wordpress@v4` handles that for you out of the box!

### `gatsby-source-graphql` and WPGraphQL input arguments

If you're using any WPGraphQL input arguments, you will need to rethink how you're accessing data. Input arguments are not currently supported as finding a good way to cache data with various input arguments is very tricky. We have some ideas on supporting this but for now it's not supported.

# Up Next :point_right:

- :house: [Hosting WordPress](./hosting.md)
- :athletic_shoe: [Themes, Starters, and Examples](./themes-starters-examples.md)
- :medal_sports: [Usage with popular WPGraphQL extensions](./usage-with-popular-wp-graphql-extensions.md)
- :hammer_and_wrench: [Debugging and troubleshooting](./debugging-and-troubleshooting.md)
- :national_park: [Community and Support](./community-and-support.md)
- :point_left: [Back to README.md](../README.md)
