---
title: Quick Start
---

This quick start is intended for intermediate to advanced developers. For a gentler intro to Gatsby, [head to our tutorial](/tutorial/)!

## Getting Started with Gatsby

1. Create a new site

```shell
npm init gatsby
```

Follow the prompts to choose your preferred CMS, styling tools and additional features.

2. Change directories into site folder

```shell
cd gatsby-site
```

3. Start development server

```shell
gatsby develop
```

Gatsby will start a hot-reloading development environment accessible by default at `http://localhost:8000`.

Try editing the home page in `src/pages/index.js`. Saved changes will live reload in the browser.

### Create a production build

```shell
gatsby build
```

Gatsby will perform an optimized production build for your site, generating static HTML and per-route JavaScript code bundles.

### Access documentation for CLI commands

To see detailed documentation for the CLI commands, run `gatsby --help` in the terminal.

For specific commands, run `gatsby COMMAND_NAME --help` e.g. `gatsby new --help`.

For more information on the Gatsby CLI, visit the [CLI reference](/docs/gatsby-cli/) section of the docs.
