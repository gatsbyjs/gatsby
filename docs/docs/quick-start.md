---
title: Quick Start
---

This quick start is intended for intermediate to advanced developers. For a gentler intro to Gatsby, [head to our tutorial](/tutorial/)!

## Use the Gatsby CLI

<EggheadEmbed
  lessonLink="https://egghead.io/lessons/gatsby-quick-start-with-gatsby-from-the-command-line-5bf2403a"
  lessonTitle="Quick Start with Gatsby: Create, Develop, and Build Gatsby Sites From the Command Line"
/>

### Install the Gatsby CLI

```shell
npm install -g gatsby-cli
```

> The above command installs Gatsby CLI globally on your machine.

#### Install the Gatsby CLI on Linux

The issue is npm try to install gatsby-cli globally (-g) which means it will write library /usr/lib/node_modules/ and executable in /usr/bin/ but your user is more than likely don't have the right to write in those folder.

The solution is to give write access to the group of those directory. To find a group where your user is member with `grep $(whoami) /etc/group`. Note: if the previous command return nothing you could identify your main group with `id -g` which instead of a group name will give you a group id.

An example the group `users`

```shell
sudo chown :users /usr/lib/node_modules /usr/bin
sudo chmod g+ws /usr/lib/node_modules /usr/bin
npm install -g gatsby-cli
```

An example the group id `100`

```shell
sudo chown :100 /usr/lib/node_modules /usr/bin
sudo chmod g+ws /usr/lib/node_modules /usr/bin
npm install -g gatsby-cli
```

### Create a new site

```shell
gatsby new gatsby-site https://github.com/gatsbyjs/gatsby-starter-hello-world
```

### Change directories into site folder

```shell
cd gatsby-site
```

### Start development server

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

### Serve the production build locally

```shell
gatsby serve
```

Gatsby starts a local HTML server for testing your built site. Remember to build your site using `gatsby build` before using this command.

### Access documentation for CLI commands

To see detailed documentation for the CLI commands, run `gatsby --help` in the terminal.

For specific commands, run `gatsby COMMAND_NAME --help` e.g. `gatsby new --help`.

For more information on the Gatsby CLI, visit the [CLI reference](/docs/gatsby-cli/) section of the docs.
