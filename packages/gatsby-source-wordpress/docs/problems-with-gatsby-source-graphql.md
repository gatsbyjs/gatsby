# Problems with `gatsby-source-graphql` :broken_heart:

`gatsby-source-graphql` skips the Gatsby Node model altogether, and allows you to directly pull data from WPGraphQL. At first this seems really attractive as things just work, but as your site grows beyond a handful of pages, a few problems arise.

- There's no way to use Gatsby Preview effectively as the Preview instance will have to run every query in your Gatsby site again. This means in many cases you would need to wait nearly the length of an entire uncached build for your preview to show up.
- There's no way to cache data. This means incremental builds can't work their magic, but it also means regular builds are very slow. Every content change in WordPress requires all the data to be refetched, making things very slow.
- Using `gatsby-image` is difficult and the images can't be cached and need to be constantly refetched during every build.
- Because the Gatsby node model is bypassed and queries are made directly to WPGraphQL, there's no simple way to build Gatsby plugins that transform data as it's sourced. Things like image replacement and link handling sometimes needed to be done client-side which added unnecessary bloat in the browser.

All of the above issues are fixed by using this plugin! :smile_cat:

# Up Next :point_right:

- :runner: [Installation & Getting started](./getting-started.md)
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
