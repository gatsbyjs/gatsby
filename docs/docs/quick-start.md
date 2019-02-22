---
title: "Quick Start"
---

This quick start is intended for intermediate to advanced developers. For a gentler intro to Gatsby, [head to our tutorial](/tutorial/)!

## Use the Gatsby CLI

<iframe title="Screencast on egghead of getting started with Gatsby." class="egghead-video" width=600 height=348 src="https://egghead.io/lessons/gatsby-quick-start-with-gatsby-create-develop-and-build-gatsby-sites-from-the-command-line/embed" />

Video hosted on [egghead.io][egghead].

[egghead]: https://egghead.io/lessons/gatsby-quick-start-with-gatsby-create-develop-and-build-gatsby-sites-from-the-command-line

### Create a new site.

```shell
npx gatsby new gatsby-site
```

### Change directories into site folder.

```shell
cd gatsby-site
```

### Start development server.

```shell
npm run develop
```

Gatsby will start a hot-reloading development environment accessible by default at `localhost:8000`.

Try editing the JavaScript pages in `src/pages`. Saved changes will live reload in the browser.

### Create a production build.

```shell
npm run build
```

Gatsby will perform an optimized production build for your site, generating static HTML and per-route JavaScript code bundles.

### Serve the production build locally.

```shell
npm run serve
```

Gatsby starts a local HTML server for testing your built site.

### Access documentation for CLI commands.

To see detailed documentation for the CLI commands, run `npx gatsby --help` in the terminal.

For specific commands, run `npx gatsby COMMAND_NAME --help` e.g. `npx gatsby new --help`.
