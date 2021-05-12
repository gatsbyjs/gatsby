# Build Caching :ballot_box:

Due to our [WPGatsby](https://github.com/gatsbyjs/wp-gatsby) WordPress plugin which tracks data changes in WordPress, we can do very aggressive caching.

On the first run of `gatsby develop` or `gatsby build` all public data is fetched from WordPress (minus any data excluded via [plugin options](../plugin-options.md#typetypenameexclude-boolean)). On subsequent builds only changed data is fetched from WordPress.
This allows [Previews](./preview.md), [Incremental Builds](#incremental-builds-triangular_ruler) and [Fast Builds](#fast-builds-running_woman) to work properly with this plugin!

**Note:** If the remote schema changes between builds, the entire cache will be invalidated and the plugin will start over and re-fetch all data. This can happen when updating your `gatsby-node.js` , `gatsby-config.js` or when adding a new npm package to your project.

# Incremental Builds :triangular_ruler:

"Incremental builds" means that only changed data is pulled from WordPress and only pages using that data are rebuilt when content changes in WordPress.

When you're using [Gatsby Cloud](https://www.gatsbyjs.com/), inc-builds will work by default! :zap:

There are no other other services which can provide true incremental builds whether they claim they can or not. If your "inc-builds" take longer than 20 seconds, consider switching to [Gatsby Cloud](https://www.gatsbyjs.com/) :smile_cat:

You can expect proper inc-build times to be between 4 - 12 seconds depending on your setup for most sites. For very large sites or sites which include other source plugins inc builds times may be longer.
We've seen that other CI services claiming to offer incremental builds usually result in 2+ minute build times and they are often slower than regular non-incremental builds on Gatsby Cloud.

# Fast Builds :running_woman:

While "Fast Builds" aren't as fast as Incremental builds, they are the default for this plugin and it's a significant improvement over previous versions of gatsby-source-wordpress (v3 or lower).
Without incremental builds Gatsby will still rebuild your whole site, but only changed data is fetched when making content updates in WordPress.

You can expect to see massively faster build times than previous versions of `gatsby-source-wordpress` and `gatsby-source-graphql`. The actual cached build time will vary depending on the size and complexity of your Gatsby site/app and the power of your CI service, but it will be in the ballpark of 30 seconds to 2 minutes for a ~1000 page site (with proper caching set up in your CI service).

Any CI/CD service will work to build your Gatsby site but [Gatsby Cloud](https://www.gatsbyjs.com/get-started/) is recommended for your build service. If you're looking to try out WP/Gatsby and want something free, Cloud has a generous free tier. It will build faster than Netlify and it can deploy to Netlify hosting for free.

## Setting up Incremental/Fast Builds

You can find our tutorial on setting up WPGatsby [here](../tutorials/configuring-wp-gatsby.md#setting-up-builds). Part-way down the page there are instructions you can follow on setting up Builds. If you're using Gatsby Cloud, setting up your Builds webhook will automatically enable Incremental Builds after your first successful uncached build has completed.

## Will it Build

See [Willit.build](https://willit.build/details/type/blog/source/wordpress/page-count/8192) for historical incremental, cached, and uncached build time benchmarking data! We have test data ranging from 512 pages to 8192 pages (and counting).

:point_left: [Back to Features](./index.md)
