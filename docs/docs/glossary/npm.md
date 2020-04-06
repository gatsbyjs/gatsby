---
title: npm or Node Package Manager
disableTableOfContents: true
---

Learn what _npm_ is, how to use it, and how it fits in to the Gatsby ecosystem.

## What is npm?

<abbr>
  npm
</abbr>, or Node Package Manager, is the default package manager for the [Node.js](/docs/glossary/node) JavaScript runtime. It lets you install and update libraries and frameworks (dependencies) for Node-based projects, and interact with the npm Registry. You'll use npm to install and upgrade Gatsby and its plugins.

npm is a [command line](/docs/glossary#command-line) tool. You'll need Terminal (Mac, Linux) or Command Prompt (Windows) in order to run its commands. To use one of npm's features, type `npm <command>` . For example, `npm help` displays a list of available features, including `install`, `uninstall`, `update`, and `search`.

npm is installed alongside Node during the default [installation process](/tutorial/part-zero/#install-nodejs-for-your-appropriate-operating-system). You don't need to take any additional steps to add it to your environment.

### Using npm to install Gatsby

To install Gatsby, use the `npm install` command. Since Gatsby needs to be installed globally as a CLI app, you'll need to use the `--global` or `-g` flags.

```shell
npm install -g gatsby-cli
```

This command will install the Gatsby command line interface, or <abbr>CLI</abbr>. Once the installation completes, you can run `gatsby new my-project` to create a new Gatsby project.

### Using npx to install Gatsby

> **Note:** `npx` requires npm version 5.2 or later. If you've installed the latest versions of Node and NPM, you should also have npx. Otherwise, you should upgrade Node and/or npm.

You can also use the [npx](https://www.npmjs.com/package/npx) command to install Gatsby. npx ships with npm. It allows you to install an npm package and run a command in one step. For example, instead of running `npm install -g gatsby-cli` then `gatsby new my-project`, you could use the following command.

```shell
npx gatsby new my-project
```

This will download and install the latest version of Gatsby, and create a new Gatsby project in the `my-project` folder. Choosing this method will not make the Gatsby CLI globally available. If you choose this method, you'll need to use `npx gatsby` or `npm run` to execute Gatsby commands, e.g.: `npx gatsby develop`.

### Using npm to install Gatsby plugins

Gatsby has a robust collection of [plugins](/plugins/) that add functionality or data sourcing to your Gatsby sites. Adding a plugin as a project dependency is similar to installing Gatsby itself. Use `npm install <package-name>` this time with the `--save` flag. To add the [gatsby-source-filesystem](/packages/gatsby-source-filesystem), plugin, for example, you'd use the following command.

```shell
npm install --save gatsby-source-filesystem
```

> **Note:** You'll still need to update `gatsby-config.js` to add the plugin's functionality to your site.

Using the `--save` flag updates the dependencies list of `package.json` and `package-lock.json`. Commit both files to your project's repository. Doing so makes it easy to keep your Gatsby project consistent across team members and computers. When another team member clones your repository, they can use `npm install` to install the dependencies included in `package-lock.json`.

### Learn more about npm

- [npm](https://www.npmjs.com/) official website
- [Node.js](https://nodejs.org/en/) official website
- [An introduction to the npm package manager](https://nodejs.dev/an-introduction-to-the-npm-package-manager) from Nodejs.dev
- [Set Up Your Development Environment](https://www.gatsbyjs.org/tutorial/part-zero/) from the Gatsby docs
