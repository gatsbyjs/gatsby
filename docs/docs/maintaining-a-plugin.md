---
title: Maintaining a Plugin
---

The Gatsby community thrives on the power of plugins, we often find that there is a plugin for almost everything ranging from source plugins to transformer plugins to plugins that are plugins for other plugin 😅. There is a very cool [naming convention for plugins](https://www.gatsbyjs.org/docs/naming-a-plugin/).

> Wondering how to [Creating a plugin](https://www.gatsbyjs.org/docs/creating-plugins/) ? Look no further . Start contributing .

## What is a Plugin ?

Gatsby plugins are Node.js packages that implement Gatsby APIs. [Learn more about Plugins](https://www.gatsbyjs.org/docs/plugins/) in this part of the Gatsby documentation.

The bulk of the work is during the development phase. However, there’s still a need to take a look at the dependecies and s security features from time to time. Keeping Plugins up to date becomes really tasking and can sometimes become really complicated since updating dependencies could potentially break your apps.

However, the effects of not updating and maintaing can bring a huge security issue to your apps and we don't want that. Let's look at some tips to apply when maintaining plugins:

## Handling patches and improvements

Most plugins generally follow [Semantic Versioning](https://semver.org/) to determine how many releases to do and the type of releases.

The first public release of a plugin is 0.1.0 or 1.0.0. From there, bugs are fixed in patch releases (e.g. 0.1.1) features are added or changed in minor releases (e.g. 0.2.0).

Version 1.0.0 should be released when the plugin's API is considered stable. Version 2.0.0 (and subsequent major releases) would introduce breaking API changes.

> Consider a version format of X.Y.Z (Major.Minor.Patch). Bug fixes not affecting the API increment the patch version, backwards compatible API additions/changes increment the minor version, and backwards incompatible API changes increment the major version.

## Update ReadMe and Use cases

Every major version update should also be reflexed in the READme of the Plugin and also in the use case examples.

It would be great for users to be able reference serveral versions of the plugin with the updated examples to see if they want to keep the current version or upgrade and also to understand what the new version offers. Although this is good:

- Try to not clog your release repository with older versions of the plugin as you updtae, as they’re not often needed. Instead, simply keep the last few in place.

- Try not to push every iterative change from Git live

## Tools for dependency version maintenance

Keeping Plugins up to date becomes really tasking and can sometimes it can become really complicated since updating dependencies could potentially break your apps. There are a couple of useful tools that can help out.

1. [Version Lens](https://marketplace.visualstudio.com/items?itemName=pflannery.vscode-versionlens) enables you to update your dependencies from your `package.json` by allowing you see the exact numbers right above each package in dependencies or devDependencies.

2. The [npm check updates](https://www.npmjs.com/package/npm-check-updates) command line tool helps to check for outdated dependecies and updating in theses steps

- install by running `npm i -g npm-check-updates`
- Running `ncu -u`

## Community supporting content and feedback.

A lot of use cases for using the created plugin would be a great way to get users to have knowledge on implentaions. Also creating forums where users of your plugins have a way to get answers to questions and help with issues, whether that’s from you or from other community members.
