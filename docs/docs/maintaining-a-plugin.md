---
title: Maintaining a Plugin
---

The Gatsby community trives on the power of plugins, we often find that there is a plugin for almost everything ranging from source plugins to transformer plugins to plugins that are plugins for other plugin 😅. There is a very cool [naming convention for plugins](https://www.gatsbyjs.org/docs/naming-a-plugin/).

> Wondering how to [Creating a plugin](https://www.gatsbyjs.org/docs/creating-plugins/) ? Look no futher. Start contributing .

## What is a Plugin ?

Gatsby plugins are Node.js packages that implement Gatsby APIs. [Learn more about Plugins](https://www.gatsbyjs.org/docs/plugins/) in this part of the Gatsby documentation.

Keeping Plugins up to date becomes really tasking and can sometimes it can become really complicated since updating dependencies could potentially break your apps.

Let's look at some tips to apply when maintianing plugins

- Have a plan for features
- Triage Issues
- Develop Improvements
- Fix bugs
- yarn workspaces can solve yarn link inconsistencies

## Handling patches and improvements

Most plugins generally follow [Semantic Versioning](https://semver.org/) to determine how many releases to do and the type of releases.

The first public release of a plugin is 0.1.0 or 1.0.0. From there, bugs are fixed in patch releases (e.g. 0.1.1) features are added or changed in minor releases (e.g. 0.2.0).

Version 1.0.0 should be released when the plugin's API is considered stable. Version 2.0.0 (and subsequent major releases) would introduce breaking API changes.

> Consider a version format of X.Y.Z (Major.Minor.Patch). Bug fixes not affecting the API increment the patch version, backwards compatible API additions/changes increment the minor version, and backwards incompatible API changes increment the major version.

## Update ReadMe and Use cases

Every major version update should also be reflexed in the READme of the Plugin and also in the usecase examples.

It would be great for users to be able reference both versions with the updated examples to see of they want to keep the current verison anf also to understnad what the new version offers. 😉

## Tools for dependency version maintance

Keeping Plugins up to date becomes really tasking and can sometimes it can become really complicated since updating dependencies could potentially break your apps. There are a couple of useful tools that can help out.

1. [Version Lens](https://marketplace.visualstudio.com/items?itemName=pflannery.vscode-versionlens) enables you to update your dependencies from your `package.json` by allowing you see the exact numbers right above each package in dependencies or devDependencies.

2. The [npm check updates](https://www.npmjs.com/package/npm-check-updates) command line tool helps to check for outdated dependecies and updating in theses steps

- install by running `npm i -g npm-check-updates`
- Running `ncu -u`

## Writing supporting content for plugin

A lot of use cases for using the created plugin would be a great way to get users to have knowledge on implentaions.
