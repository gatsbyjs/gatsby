---
title: "Quick Start"
---

This quick start is intended for intermediate to advanced developers. For a gentler intro to Gatsby, [head to our tutorial](/tutorial/)!

## Use the Gatsby CLI

<EggheadEmbed
  lessonLink="https://egghead.io/lessons/gatsby-quick-start-with-gatsby-create-develop-and-build-gatsby-sites-from-the-command-line"
  lessonTitle="Quick Start with Gatsby: Create, Develop, and Build Gatsby Sites From the Command Line"
/>

**Note**: this video uses `npx`, which is a tool to execute an npm package without first installing it. Running the command `npx gatsby new` is the same as running `gatsby new` after installing the gatsby-cli on your computer.

### Install Node.js

In order to execute the Gatsby CLI (command-line interface) you will need to have [Node.js](https://nodejs.org/) installed on your machine. Node.js comes with `npm` and `npx` pre-installed. 

To install node.js head over to the official webpage at [nodejs.org](https://nodejs.org/). You will need to install node 6.11.5 or later to run Gatsby.

### Install the Gatsby CLI.

```shell
npm install -g gatsby-cli
```

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
