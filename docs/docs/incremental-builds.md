---
title: Incremental Builds
---

Gatsby sources data from multiple sources (CMS, static files like Markdown, databases, APIs etc) and creates an aggregated data set in GraphQL. Currently, each `gatsby build` uses the GraphQL data set and queries to do a complete rebuild of the whole app, including static assets, such as HTML, JavaScript, JSON, and media files etc) from the graphQL queries, ready for deployment. For projects that have a small (10s to 100s) to medium (100s to 1000s) amount of content, these full builds don't present a problem.

Sites with large amounts of content (10,000s upwards 😱) start to see increased build times and increased demand on CPU and memory. 

Also, one of the principals of modern Continous Integration/Continuous Deployment is to release change (and therefore risk) in small batches. A full app rebuild may not be in line with that principle for some projects.

One solution to these problems might be to use [Gatsby Cloud](https://www.gatsbyjs.com/cloud/)'s 'Build' features (currently in [Beta](https://www.gatsbyjs.com/builds-beta/)).

For projects that require self-hosted environments, where Gatsby Cloud would not be an option, being able to **incrementally build** only the content that has changed (or new) would help reduce build times and demand on resources, whilst helping keep in line with CI/CD principles. 

For more info on the standard build process please see [overview of the gatsby build process](/docs/overview-of-the-gatsby-build-process/)

## How to use

To enable optional incremental builds, use the environment variable `GATSBY_INCREMENTAL_BUILD=true` in your `gatsby build` command, for example: 

`GATSBY_INCREMENTAL_BUILD=true gatsby build`

This will run the Gatsby build process, but only build assets that have changed (or are new) since your last build.

### Reporting what has been built

After an incremental build has completed, you might need to get a list of the assets that have been built, for example, if you want to perform a sync action in your CI/CD pipeline.

To list the paths in the build assets (`public`) folder, you can use one (or both) of the following arguments in your `build` command.

- `--log-pages`  outputs the updated paths to the console at the end of the build

```
success Building production JavaScript and CSS bundles - 82.198s
success run queries - 82.762s - 4/4 0.05/s
success Building static HTML for pages - 19.386s - 2/2 0.10/s
+ success Delete previous page data - 1.512s
success Update cache for next build - 1.202s
info Done building in 152.084 sec
+ info Incremental build pages:
+ Updated page: /about
+ Updated page: /accounts/example
+ info Incremental build deleted pages:
+ Deleted page: /test

Done in 154.501 sec
```

- `--write-to-file` creates two files in the `.cache` folder, with lists of the changes paths in the build assets (`public`) folder. 

  - `newPages.txt` will contain a list of paths that have changed or are new
  - `deletedPages.txt` will contain a list of paths that have been deleted

If there are no changed or deleted paths, then the relevant files will not be created in the `.cache` folder.

## Further considerations

- To enable incremental builds you will need to set an environment variable, so you will need access to set variables in your build environment
- You will need to persist the cached `.cache/redux.state` file between builds, allowing for comparison on an incremental build, if there is no `redux.state` file located in the `.cache` the folder then a full build will be triggered
- The root JS bundle will still get generated on incremental builds, you will need to deploy these JS files as well as changed paths 
- Any code changes (templates, components, source handling, new plugins etc) will require a full `gatsby build`
