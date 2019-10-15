---
title: Using Gitpod, an Online Dev Environment
---

This page outlines how to use Gitpod, a free online dev environment, to contribute to Gatsby core and its ecosystem. For instructions on setting up a dev environment locally, visit the [local set-up](/contributing/setting-up-your-local-dev-environment/) page.

## About Gitpod

Gitpod makes contributions on GitHub easier, by allowing automated development environment setups. Instead of writing lengthy
documentation of what to install and configure and letting every contributor go through this adventure, the setup is automated and reproducible.

Furthermore, Gitpod prebuilds any branch of a repository so that you don't need to wait for installation, cloning and building.

## Get Started

To start a fresh dev environment you can prefix the any GitHub URL with `gitpod.io/#`.

> Example: https://gitpod.io/#https://github.com/gatsbyjs/gatsby

The started dev environment will open with a ready-built gatsby core project as well as one built example (gatsbygram).
Three terminals are started side-by-side running the following processes:

- `yarn run watch --scope={gatsby,gatsby-image,gatsby-link}`
  Watches and rebuilds the gatsby core code on any changes
- `gatsby-dev`
  Copies over the changes from core to the example
- `gatsby develop`
  Serves the example in development mode

The running example app is shown on the right in a preview window.

## Working on an Issue

To start working on an issue, you can prefix the issue URL with `gitpod.io/#`.

> Example: https://gitpod.io/#https://github.com/gatsbyjs/gatsby/issues/1199

This will open a fresh environment with a local branch named after the issue.
You can now code, test, commit, push and create a PR from within the workspace.

## Code Reviews

Some code changes need a deeper review than what is possible on GitHub. Prefixing a PR with `gitpod.io/#` will open that branch in code review mode.

In this mode you see the list of file changes on the left and can navigate through them. You can run the app and use the editing features to explore the changed code base. You can see existing comments or add new comments in the editor and submit your review result as well.

## How to Run Another Example

If you want to run another example you can open a terminal or use an existing one and run the following commands:

```shell
yarn install
gatsby-dev --set-path-to-repo ../..
gatsby-dev
yarn run dev
```
