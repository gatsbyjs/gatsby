---
title: Experimental Page Build Optimizations for Incremental Data Changes
---

Building sites with large amounts of content (10,000s nodes upwards) is relatively fast with Gatsby. However, some projects might start to experience issues when adopting CI/CD principles - continuously building and deploying. Gatsby rebuilds the complete app on each `gatsby build` which means the complete app also needs to be deployed. Doing this each time a small data change occurs unnecessarily increases demand on CPU, memory, and bandwidth.

[Incremental Builds](/blog/2020-04-22-announcing-incremental-builds/) provides Gatsby Cloud users with support for incremental data changes to Gatsby sites. Incremental Builds only rebuilds the data that has changed, reliably reducing build times to under 10 seconds.

For projects that require self-hosted environments, where Gatsby Cloud is not an option, the experimental page build optimizations for incremental data changes documented below can help reduce build times, deployment times, and demand on resources.

For more info on the standard build process, please see the [overview of the gatsby build process](/docs/overview-of-the-gatsby-build-process/).

For more info on Incremental Builds in Gatsby Cloud, please see [Incremental Builds in Gatsby Cloud](https://www.gatsbyjs.com/docs/incremental-builds/).

## How to use

To enable this enhancement, use the environment variable `GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES=true` in your `gatsby build` command, for example:

`GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES=true gatsby build --log-pages`

This will run the Gatsby build process, but only build pages that have data changes since your last build. If there are any changes to code (JS, CSS) the bundling process returns a new webpack compilation hash which causes all pages to be rebuilt.

### Reporting what has been built

You may want to retrieve a list of the pages that were built. For example, if you want to perform a sync action in your CI/CD pipeline.

To list the paths in the build assets (`public`) folder, you can use one (or both) of the following arguments in your `build` command.

- `--log-pages` parameter will output all the file paths that were updated or deleted at the end of the build stage.

```bash
success Building production JavaScript and CSS bundles - 82.198s
success run queries - 82.762s - 4/4 0.05/s
success Building static HTML for pages - 19.386s - 2/2 0.10/s
+ success Delete previous page data - 1.512s
info Done building in 152.084 sec
+ info Built pages:
+ Updated page: /about
+ Updated page: /accounts/example
+ info Deleted pages:
+ Deleted page: /test

Done in 154.501 sec
```

- `--write-to-file` creates two files in the `.cache` folder, with lists of the changed paths in the build assets (`public`) folder.

  - `newPages.txt` will contain a list of new or changed paths
  - `deletedPages.txt` will contain a list of deleted paths

If there are no changed or deleted paths, then the relevant files will not be created in the `.cache` folder.

## More information

- This enhancement works by comparing the page data from the previous build to the new page data. This creates a list of page directories that are passed to the static build process.

- To enable this build option you will need to set an environment variable, which requires access to do so in your build environment.

- This feature is not available with `gatsby develop`.

- You will need to persist the `.cache` and `public` directories between builds. This allows for comparisons and reuse of previously built files. If `.cache` directory was not persisted then a full build will be triggered. If `public` directory was not persisted then you might experience failing builds or builds that are missing certain assets.

- Any code or static query changes (templates, components, source handling, new plugins etc) will prompt the creation of a new webpack compilation hash and trigger a full build.

Note: When using the `GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES` flag it is important to do so consistently when building your project. Otherwise, the cache will be cleared and the necessary data for comparison will no longer be available, removing the ability to check for incremental data changes.
