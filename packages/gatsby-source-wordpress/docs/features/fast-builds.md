# Fast Builds :running_woman:

Due to our [WPGatsby](https://github.com/gatsbyjs/wp-gatsby) WordPress plugin, we can do very aggressive caching. This means that even without [incremental builds](./incremental-builds.md) your build times will be mighty fast!

You can expect to see massively faster build times than previous versions of `gatsby-source-wordpress` and `gatsby-source-graphql`. The actual cached build time will vary depending on the size and complexity of your Gatsby site/app and the power of your CI service, but it will be in the ballpark of 1 to 2 minutes for a ~1000 page site with proper caching.

Any CI/CD service will work to build your Gatsby site but [Gatsby Cloud](https://www.gatsbyjs.com/get-started/) is recommended for your build service. If you're looking to try out WP/Gatsby and want something free, Cloud has a generous free tier. It will build faster than Netlify and it can deploy to Netlify hosting for free. It also comes with 25 free real-time edits**\*** per day for 2 weeks, so you can try out the paid features of Gatsby Cloud to see if it will work for your project (hint, it surely will. it's :fire:!).

**\***_a real-time edit is 1 preview or inc-build_

## Setting up Fast Builds

You can find our tutorial on setting up WPGatsby [here](../tutorials/configuring-wp-gatsby.md#setting-up-preview). Part-way down the page there are instructions you can follow on setting up Builds. If you're using Gatsby Cloud, setting up your Builds webhook will automatically enable Fast Builds after your first successful uncached build has completed. If you're using other CI providers than Gatsby Cloud, you will need to enable a caching mechanism to persist the Gatsby `.cache` and `public` directories between builds.

## Will it Build

See [Willit.build](https://willit.build/details/type/blog/source/wordpress/page-count/8192) for historical incremental, cached, and uncached build time benchmarking data! We have test data ranging from 512 pages to 8192 pages (and counting).

:point_left: [Back to Features](./index.md)
