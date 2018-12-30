---
title: "Quick Start"
---

This quick start is intended for intermediate to advanced developers. For a gentler intro to Gatsby, [head to our tutorial](/tutorial/)!

## Install Gatsby's command line tool

```shell
npm install --global gatsby-cli
```

## Use the Gatsby CLI

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

Gatsby starts a local HTML server for testing your built site.

### Access documentation for CLI commands.

To see detailed documentation for the CLI commands, run `gatsby --help` in the terminal.

For specific commands, run `gatsby COMMAND_NAME --help` e.g. `gatsby develop --help`.
