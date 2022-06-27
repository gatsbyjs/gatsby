# Installation & Getting Started :baby_chick:

If you've had previous experience with Gatsby or you like to move fast, you can use the quick start steps below to get up and running quickly. If you'd like to take a step back and learn more first, head over to our [tutorials](./tutorials/index.md) :footprints:

## Quick start

1. [Install Node, Gatsby, and gatsby-cli](https://www.gatsbyjs.com/docs/)
2. Install [a starter](https://github.com/gatsbyjs/gatsby-starter-wordpress-blog) `gatsby new my-wordpress-gatsby-site https://github.com/gatsbyjs/gatsby-starter-wordpress-blog`
3. Install and activate both of the following plugins in a live WordPress instance.

   - [WPGraphQL](https://wordpress.org/plugins/wp-graphql/)
   - [WPGatsby](https://wordpress.org/plugins/wp-gatsby/)

4. In the `gatsby-config.js` of the starter you just set up, update the plugin options for `gatsby-source-wordpress`. Change the `url` option so that it points to your WordPress instance GraphQL url. This should be the full url of your GraphQL endpoint. E.g. `https://yoursite.com/graphql`
5. Run `gatsby develop` and experience the magic :star2:
6. Create your beautiful and accessible app :nail_care:
7. Build with [Gatsby Cloud](https://www.gatsbyjs.com/) & deploy to [Netlify](https://www.gatsbyjs.com/guides/netlify/) for a fast, wonderful, _and_ affordable CI/CD experience :boom: :rocket:

### Hot tip

For a fast, easy, and reliable WordPress local dev server, use [Local by Flywheel](https://localwp.com/). This will save you time setting up WordPress on your computer and you can easily push and pull to and from Flywheel/WPEngine hosting!

## Required WordPress Dependencies

In addition to WordPress, there are 2 other required plugins on the PHP side of things. If you're on the latest version of the source plugin and these plugins, everything will work great. If there is a version mismatch, you'll be notified and provided a download link for the correct versions in your terminal via our [compatibility API](./features/compatibility-api.md) when you run a build :smile:

### WPGraphQL

This plugin turns your WordPress instance into a GraphQL server.

- [Source code](https://github.com/wp-graphql/wp-graphql)
- [Docs](https://docs.wpgraphql.com/)
- [Website](https://www.wpgraphql.com/)

### WPGatsby

This plugin modifies the WPGraphQL schema in Gatsby-specific ways and also keeps a record of when user actions happened. This allows us to do selective cache invalidation in Gatsby (to speed up builds) and add Preview support.

- [Source code](https://github.com/gatsbyjs/wp-gatsby)

### WordPress

Please note that we only officially support the latest version of WordPress. However, WordPress is great at keeping backwards compatibility and older versions may work.

- [Source code](https://wordpress.org/download/source/)
- [Docs](https://codex.wordpress.org/)
- [Website](https://wordpress.org)

# Up Next :point_right:

- :school: [Tutorials](./tutorials/index.md)
- :feet: [Features](./features/index.md)
- :electric_plug: [Plugin options](./plugin-options.md)
- :boat: [Migrating from other WP source plugins](./migrating-from-other-wp-source-plugins.md)
- :house: [Hosting WordPress](./hosting.md)
- :athletic_shoe: [Themes, Starters, and Examples](./themes-starters-examples.md)
- :medal_sports: [Usage with popular WPGraphQL extensions](./usage-with-popular-wp-graphql-extensions.md)
- :hammer_and_wrench: [Debugging and troubleshooting](./debugging-and-troubleshooting.md)
- :national_park: [Community and Support](./community-and-support.md)
- :point_left: [Back to README.md](../README.md)
