---
title: "Quick Start"
---

This quick start is intended for intermediate to advanced developers. For a gentler intro to Gatsby, [head to our tutorial](/tutorial/)!

## Use the Gatsby CLI

<iframe title="Screencast on egghead of getting started with Gatsby." class="egghead-video" width={600} height={348} src="https://egghead.io/lessons/gatsby-quick-start-with-gatsby-create-develop-and-build-gatsby-sites-from-the-command-line/embed" />

Video hosted on [egghead.io][egghead].

[egghead]: https://egghead.io/lessons/gatsby-quick-start-with-gatsby-create-develop-and-build-gatsby-sites-from-the-command-line

### Install the Gatsby CLI.

```shell
npm install -g gatsby-cli
```

> _Note: see [info about using `npx`](#note-on-using-npx), as referenced in the above video._

### Create a new site.

```shell
gatsby new gatsby-site
```

### Change directories into site folder.

```shell
cd gatsby-site
```

### Start development server.

```shell
gatsby develop
```

Gatsby will start a hot-reloading development environment accessible by default at `localhost:8000`.

Try editing the JavaScript pages in `src/pages`. Saved changes will live reload in the browser.

### Create a production build.

```shell
gatsby build
```

Gatsby will perform an optimized production build for your site, generating static HTML and per-route JavaScript code bundles.

### Serve the production build locally.

```shell
gatsby serve
```

Gatsby starts a local HTML server for testing your built site. Remember to build your site using `gatsby build` before using this command.

### Access documentation for CLI commands

To see detailed documentation for the CLI commands, run `gatsby --help` in the terminal.

For specific commands, run `gatsby COMMAND_NAME --help` e.g. `gatsby new --help`.

For more information on the Gatsby CLI, visit the [CLI reference](/docs/gatsby-cli/) section of the docs.

### Note on using `npx`

The embedded Egghead video on this page uses [`npx`](https://hackernoon.com/npx-npm-package-runner-7f6683e4304a), an npm package runner that helps to execute packages without having to install them explicitly. This tool is optional, but it allows you to interact with and run the Gatsby CLI node module without having it downloaded locally. The common alternative to npx, documented on this page, is to [install Gatsby CLI globally](#install-the-gatsby-cli) so you can use it for multiple Gatsby projects.
