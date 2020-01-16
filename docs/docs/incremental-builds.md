---
title: Incremental builds
---

Currently, to ensure all pages are in sync with the latest content from content sources/CMS, a `gatsby build` requires Gatsby to repopulate the pages by rebuilding all the static assets such as HTML pages and page-data.json ready for deployment. On sites that are relatively small, this approach is fine. For larger heavy content sites that require continuous deployment, an incremental build can speed up your deployments by building only the pages that have been updated by the CMS.

For more info on the standard build process please view https://www.gatsbyjs.org/docs/overview-of-the-gatsby-build-process/

## Warning

Implementing incremental build may require access to your own CI/CD build pipelines. If you don't have access to your own CI/CD pipeline, your site is relatively small or doesn't require to be on-premise consider using Gatsby JS cloud solution. https://www.gatsbyjs.com/cloud/

Incremental build should only run on content changes, any code changes will require a full build.

## Setting up incremental builds

Set the environment variable to `GATSBY_INCREMENTAL_BUILD=true` whilst running the command `gatsby build GATSBY_INCREMENTAL_BUILD=true {optional parameter}`.

There are two optional parameters to view the output from incremental build:

### --write-to-file

The `--write-to-file` will create two text files in the gatsby `.cache` folder:

- `newPages.txt` will contain a list of directory values of the pages that have changed or are new.
- `deletedPages.txt` will contain a list of directory values of content removed from the CMS.

Note that these files will not be created if there are no values.

### --log-pages

The `--log-pages` parameter will output all the file paths that have been updated or deleted at the end of the build stage

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
+ Deleted page: /about
+ Deleted page: /accounts/example

```

### Updating Your CI/CD

An incremental build is different to a standard build in that it will not clear the public directory and will only build the pages that have content changes from a content source.

As noted above, the optional parameters can output a list of changed directory paths at the end of a `gatsby build`. These directories will only refer to the files that have been updated by the `gatsby build` process.
This opens a number of options in your own CI/CD pipeline. For instance, you could utilize these values to only sync the new files when deploying your site.

## More information

- Incremental builds work by comparing the page data from the previous build to the new page data.
- At the end of each build, gatsby creates a redux.state file in .cache that containing the all previous build data. This is used to populate the redux store on the initial build.
- An incremental build reads the cached data file and compares it against the new page data. This then gets a list of directories that have either been updated or deleted, which are passed to the static build process.
- As there are no code changes the JS webpackCompilation hash is not updated, therefore any new pages will not require a js cache-busting.
- You will need to save the `.cache/redux.state` file between builds, allowing for comparison on an incremental build. If no `redux.state` file is present then a full build will be triggered.
