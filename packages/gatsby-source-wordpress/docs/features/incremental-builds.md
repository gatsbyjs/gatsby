# Incremental Builds :triangular_ruler:

"Incremental builds" means that only changed data is pulled from WordPress and only pages using that data are rebuilt when content changes in WordPress.

When you're using [Gatsby Cloud](https://www.gatsbyjs.com/), inc-builds will work by default! :zap:

There are no other other services which can provide true incremental builds wether they claim they can or not. If your "inc-builds" take longer than a minute, consider switching to [Gatsby Cloud](https://www.gatsbyjs.com/) :smile_cat:

You can expect proper inc-build times to be between 4 - 12 seconds depending on your setup.

## Setting up Incremental Builds

You can find our tutorial on setting up WPGatsby [here](../tutorials/configuring-wp-gatsby.md#setting-up-preview). Part-way down the page there are instructions you can follow on setting up Builds. If you're using Gatsby Cloud, setting up your Builds webhook will automatically enable Incremental Builds after your first successful uncached build has completed.

## Will it Build

See [Willit.build](https://willit.build/details/type/blog/source/wordpress/page-count/8192) for historical incremental, cached, and uncached build time benchmarking data! We have test data ranging from 512 pages to 8192 pages (and counting).

:point_left: [Back to Features](./index.md)
