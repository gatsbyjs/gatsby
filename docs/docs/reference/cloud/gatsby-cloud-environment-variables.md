---
title: "Environment Variables Specific to Gatsby Cloud"
description: "Learn all about the special environment variables support to configure your Gatsby Cloud site"
---

The environment variables below allow you to configure features of Gatsby Cloud:

- `NODE_VERSION`: Specify the version of Node.js your project should use. For example, `NODE_VERSION=10`. Defaults to `14`.
- `NPM_TOKEN`: Use to access private npm modules.
- `NPM_REGISTRY`: Use to set the URL of a private registry.
- `YARN_FLAGS`: Flags that are passed through to the yarn command.
- `NODE_OPTIONS`: Passed through as options for Node.js. For example, - `NODE_OPTIONS=--max-old-space-size=4096`.
- `PREFIX_PATHS`: Set to true to enable the `--prefix-paths` flag during `gatsby build`. See the docs on [prefix-paths](/docs/how-to/previews-deploys-hosting/path-prefix/).

## Read-only variables

These variables are pre-defined for both Builds and Preview environments. They are set automatically and cannot be changed. You can reference them in your `gatsby-config.js` or anywhere else you would normally reference an environment variable.

- `BRANCH`: The name of the current git branch. Useful for swapping environment variables depending on the branch.
- `CI`: Always `true`.
- `GATSBY_CLOUD`: Always true. Useful for checking if your build is running on Gatsby Cloud.
- `GATSBY_IS_PREVIEW`: true only in the CMS Preview environment, for both [legacy preview builder and incremental preview builder](https://support.gatsbyjs.com/hc/en-us/articles/360055676874).
- `NODE_ENV`:
  - is `production` for Production Builds and Pull Request Builds
  - is `development` for CMS Previews which use the [legacy preview builder](https://support.gatsbyjs.com/hc/en-us/articles/360055676874)
  - is `production` for CMS Previews that use the new [incremental preview builder](https://support.gatsbyjs.com/hc/en-us/articles/360055676874)
  - Regardless of the environment variable value, CMS Preview builds still use preview data
