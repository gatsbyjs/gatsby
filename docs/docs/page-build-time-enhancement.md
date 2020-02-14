---
title: Page Build Time Enhancement
---

Gatsby sources data from multiple sources (CMS, static files - like Markdown, databases, APIs, etc) and creates an aggregated dataset in GraphQL. Currently, each gatsby build uses the GraphQL dataset and queries to do a complete rebuild of the whole app - ready for deployment - including static assets like HTML, JavaScript, JSON, media files, etc.

Projects that have a small (10s to 100s) to medium (100s to 1000s) amount of content, deploying these sites don't present a problem.

Building sites with large amounts of content (10,000s upwards) are relatively fast with Gatsby. The issue arises when we need to support CI/CD principles, continuously building and deploying all assets have increased demand on CPU and memory.

One solution to these problems might be to use [Gatsby Cloud's 'Build' features](https://www.gatsbyjs.com/cloud/).

For projects that require self-hosted environments, where Gatsby Cloud would not be an option, this page build enhancement can speed up your deployments by building only the pages that have been updated by the content sources.

For more info on the standard build process please see [overview of the gatsby build process](/docs/overview-of-the-gatsby-build-process/)

## Warning

This enhancement will require access to your own CI/CD build pipelines. If your site is relatively small and doesn't require to be on-premise consider using [Gatsby JS cloud solution](https://www.gatsbyjs.com/cloud/).

## Setup

Set the environment variable to `GATSBY_PAGE_BUILD_ON_DATA_CHANGES=true` whilst running the command

`GATSBY_PAGE_BUILD_ON_DATA_CHANGES=true node ./node_modules/.bin/gatsby build`.

Optionally, if you want to list the directories of the pages that have been updated at the end of the build process, you can use one of the following arguments:

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
info Done building in 152.084 sec
+ info Built pages:
+ Updated page: /about
+ Updated page: /accounts/example
+ info Deleted pages:
+ Deleted page: /test

Done in 154.501 sec
```

## More information

- This enhancement works by comparing the page data from the previous build to the new page data. This creates a list of page directories that are passed to the static build process.

- To enable this build option you will need to set an environment variable, so you will need access to set variables in your build environment.

- At the end of each build, gatsby creates a `redux.state` file in `/.cache` that containing the all previous build data. You will need to persist the `.cache/redux.state` between builds, allowing for comparison, if there is no `redux.state` file located in the `/.cache` the folder then a full build will be triggered.

- Any code or static query changes (templates, components, source handling, new plugins etc) creates a new webpack compilation hash and triggers a full build.
