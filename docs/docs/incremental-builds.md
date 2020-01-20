---
title: Incremental Builds
---

A `gatsby build` will fetch the latest data and rebuild all the static assets such as HTML pages and page-data.json. This ensures all pages are in sync with the latest data from the content sources, ready for deployment. On sites that are relatively small, this approach is fine. For sites with large amounts of content (thousands of pages) that require continuous deployment, or require their site to be on-premises this can become an issue. Rebuilding all the pages on every content update can be expensive in terms of CPU, memory and deployment times.

An incremental build can speed up your deployments by building only the pages that have been updated by the content sources.

For more info on the standard build process please see [overview of the gatsby build process](/docs/overview-of-the-gatsby-build-process/)

## Warning

Implementing incremental build will require access to your own CI/CD build pipelines. If your site is relatively small and doesn't require to be on-premise consider using [Gatsby JS cloud solution](https://www.gatsbyjs.com/cloud/).

## Setting up incremental builds

Set the environment variable to `GATSBY_INCREMENTAL_BUILD=true` whilst running the command

`GATSBY_INCREMENTAL_BUILD=true gatsby build {optional parameter}`.

Optionally, if you want to list the directories of the pages that have been updated at the end of the incremental build process, you can use one of the following parameters:

### --write-to-file

The `--write-to-file` will create two text files in the gatsby `.cache` folder:

- `newPages.txt` will contain a list of directory values of the pages that have changed or are new.
- `deletedPages.txt` will contain a list of directory values of pages removed from the content sources.

**Note that these files will not be created if there are no values.**

### --log-pages

The `--log-pages` parameter will output all the file paths that have been updated or deleted at the end of the build stage.

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

```

## More information

- Incremental builds work by comparing the page node data from the previous build to the new page node data. An incremental build reads a file in the .cache directory named `redux.state` and compares it against the new page node data. A list of page directories are passed to the static build process.
- An incremental build will not clear the public directory and will only build the pages that have content changes from a content source.
- At the end of each build, gatsby creates a redux.state file in .cache that containing the all previous build data.
- You will need to save the `.cache/redux.state` file between builds, allowing for comparison on an incremental build. If no `redux.state` file is present then a full build will be triggered.
