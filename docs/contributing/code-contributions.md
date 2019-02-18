---
title: Code Contributions
---

The beauty of contributing to open source is that you can clone your favorite project, get it running locally, and test out experiments and changes in real time! Way to feel like a wizard.

## Repo setup

This page includes details specific to the Gatsby core and ecosystem codebase.

To start setting up the Gatsby repo on your machine using git, Yarn and Gatsby-CLI, check out the page on [setting up your local dev environment](/contributing/setting-up-your-local-dev-environment/).

To contribute to the blog or Gatsbyjs.org website, check out the setup steps on the [blog and website contributions](/contributing/blog-and-website-contributions/) page. For instructions on contributing to the docs, visit the [docs contributions page](/contributing/docs-contributions/).

### Creating your own plugins and loaders

If you create a loader or plugin, we would love for you to open source it and put it on npm. For more information on creating custom plugins, please see the documentation for [plugins](/docs/plugins/) and the [API specification](/docs/api-specification/).

## Making changes to the starter library

Note: You don't need to follow these steps to submit to the starter library. This is only necessary if you'd like to contribute to the functionality of the starter library. To submit a starter, [follow these steps instead](/contributing/submit-to-starter-library/).

To develop on the starter library, you'll need to supply a GitHub personal access token.

1. Create a personal access token in your GitHub [Developer settings](https://github.com/settings/tokens).
2. In the new token's settings, grant that token the "public_repo" scope.
3. Create a file in the root of `www` called `.env.development`, and add the token to that file like so:

```text:title=.env.development
GITHUB_API_TOKEN=YOUR_TOKEN_HERE
```

The `.env.development` file is ignored by git. Your token should never be committed.

## Development tools

### Debugging the build process

Check [Debugging the build process](/docs/debugging-the-build-process/) page to learn how to debug Gatsby.
