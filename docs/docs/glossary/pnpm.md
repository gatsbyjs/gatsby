---
title: Pnpm
disableTableOfContents: true
description: Learn what the Pnpm package manager is, how to use it, and how it fits in to the Gatsby ecosystem.
---

Learn what the _Pnpm_ package manager is, how to use it, and how it fits in to the Gatsby ecosystem.

## What is Pnpm?

Pnpm is a package manager for the [Node.js](/docs/glossary/node) JavaScript runtime. It's an alternative to Node's standard package manager, [npm](/docs/glossary/npm). [Contributing](/contributing/code-contributions#setting-up-your-local-dev-environment) to Gatsby core requires Pnpm. Gatsby core uses Pnpm's [workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) feature to manage dependencies. Gatsby [theme development](/tutorial/building-a-theme/) also uses Pnpm workspaces. For Gatsby site development, you can use Pnpm or npm.

> **Note:** Most tutorials and site development examples from the Gatsby docs use npm. To avoid confusion and possible conflicts with your dependencies, Gatsby recommends using npm for site development.

Engineers from Facebook, Google, Exponent, and Tilde [launched Pnpm](https://engineering.fb.com/web/pnpm-a-new-package-manager-for-javascript/) in 2016 to improve package management for large-scale, monolithic repositories. A monolithic repository, or [_monorepo_](https://en.wikipedia.org/wiki/Monorepo), contains the code for many different projects in a single repository. Gatsby core uses a monorepo pattern for its code.

As a monorepo adds projects and contributors, the number and size of its dependencies also increases. Pnpm mitigates this in two ways.

1. It caches previously downloaded packages.
2. It resolves duplicate dependencies so that a package is only downloaded once.

As a result, installing or updating a monorepo often takes less time with Pnpm than with npm.

### Installing Pnpm

You may install pnpm even if you don't have Node.js installed, using the following scripts.

On Windows
Using PowerShell:

```shell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

On POSIX systems

```shell
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

If you don't have curl installed, you would like to use wget:

```shell
wget -qO- https://get.pnpm.io/install.sh | sh -
```

TIP
You may use the pnpm env command then to install Node.js.

Using Corepack
Since v16.13, Node.js is shipping Corepack for managing package managers. This is an experimental feature, so you need to enable it by running:

INFO
If you have installed Node.js with pnpm env Corepack won't be installed on your system, you will need to install it separately.

```shell
corepack enable pnpm
```

If you installed Node.js using Homebrew, you'll need to install corepack separately:

```shell
brew install corepack
```

This will automatically install pnpm on your system.

You can pin the version of pnpm used on your project using the following command:

```shell
corepack use pnpm@latest
```

This will add a "packageManager" field in your local package.json which will instruct Corepack to always use a specific version on that project. This can be useful if you want reproducability, as all developers who are using Corepack will use the same version as you. When a new version of pnpm is released, you can re-run the above command.

### Using Pnpm to install Gatsby

Once installed, you can use Pnpm to install the Gatsby CLI globally or locally. If you'd like to use Gatsby CLI commands such as `gatsby new`, install the CLI globally using the [`global` prefix](https://classic.yarnpkg.com/en/docs/cli/global/).

```shell
pnpm add -g gatsby-cli
```

You can also install Gatsby locally using `pnpm add gatsby-cli`. If you use this method, you'll need to prefix Gatsby commands with `pnpm run`, for example, `pnpm run gatsby develop`.

### Using Pnpm as your Gatsby package manager

When you run `gatsby new` for the first time, you'll be prompted to choose npm or Pnpm as your default package manager. You can choose Pnpm then, or change it at a later time. To switch from npm to Pnpm, edit the Gatsby CLI configuration file available at `~/.config/gatsby/config.json` to add the following lines.

```shell
{
  "cli": {
    "packageManager": "pnpm@9.0.4",
  }
}
```

Gatsby will use Pnpm as the package manager for new projects. You can also install Gatsby plugins using Pnpm. Replace `npm install` or `npm i` with `pnpm add`.

Using Pnpm to install packages generates a `pnpm-lock.yaml` file. The `pnpm-lock.yaml` tracks the exact version that you installed with `pnpm add`, similar to `package-lock.json`. Commit `pnpm-lock.yaml` to your project's repository. Doing so keeps your dependencies consistent across team members and computers.

### Learn more about Pnpm

- [The package.json guide](https://nodejs.dev/learn/the-package-json-guide) from Nodejs.dev
- [Pnpm](https://pnpm.io) official website
- [Building a Theme](/tutorial/building-a-theme/)
- [Gatsby Theme Authoring](https://egghead.io/courses/gatsby-theme-authoring) from egghead.io
- [How to change your default package manager for your next project?](/docs/reference/gatsby-cli/#how-to-change-your-default-package-manager-for-your-next-project) from the Gatsby CLI docs
- [Setting Up Your Local Dev Environment](/contributing/code-contributions#setting-up-your-local-dev-environment) for contributions to the Gatsby project
