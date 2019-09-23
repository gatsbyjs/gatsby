---
title: Upgrade Gatsby for minor or patch releases
---

## Introduction

To keep up with the latest bug fixes, security patches and minor releases from both Gatsby and its dependencies, you should constantly upgrade to the latest version of each one.

In this guide you will learn how to upgrade Gatsby and its dependencies for minor or patch releases.

## Semantic versioning

As many other pacakages, Gatsby uses [semantic versioning](https://semver.org/) to tag new versions and indicate what kind of changes are introduced in every new release.

This guide is meant to teach you how to upgrade Gatsby for minor or patch releases. For major changes you can refer to our [Release and Migrations](https://www.gatsbyjs.org/docs/releases-and-migration/) reference guide overview for the corresponding guide to upgrade.

## Why you should upgrade Gatsby and its dependencies

Every new version of every package comes with improvements on multiple categories from performance, accesibility, to security and bug fixes, among others, so it is important to upgrade both Gatsby and its dependencies to get the latest improvements in every one of these categories.

Constantly upgrading your dependencies on minor or patch releases also helps you to make major upgrades easier and to identify ossible soon to be deprecated functionality or APIs.

## How to identify possible upgrades

Depending on your current setup, you can use one of [yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/get-npm) to update your dependencies.

To start, you can run the outdated command to identify new releases for all your dependencies. Remember that you only have to use one of npm or yarn, not both of them.

```shell
npm outdated
```

```shell
yarn outdated
```

This will output a table indicating which packages have new versions available and what is the latest version for each one.

```
Package                            Current   Wanted   Latest  Location
gatsby                             2.15.13  2.15.13  2.15.20
```

## Configure your dependencies for upgrades

Depending on whether you want to update Gatsby and its dependencies for minor or patch releases you need to modify your `package.json` accordingly. If you only want to update for patch releases, you can add a tilde before the version of your package:

```title=package.json
"dependencies"{
  "gatsby": "~2.15.13",
}
```

For both patch and minor updates, add a caret before the version of your package:

```title=package.json
"dependencies"{
  "gatsby": "^2.15.13",
}
```

For major updates follow up with the corresponding guide from the [Release and Migrations](https://www.gatsbyjs.org/docs/releases-and-migration/) reference guide overview.

In case that you are updating Gatsby, be sure to also update Gatsby related plugins, you can identify them because their name starts with `gatsby-`, this only applies to plugins managed in the gatsbyjs/gatsby repo, for community plugins check beforehand if there is a new version you can upgrade to.

## Updating all your dependencies at once

After adding the corresponding annotations into your `package.json` file, you can run the update command in npm or the upgrade command if you are using yarn, remember that you only have to use one of yarn or npm:

```shell
npm update
```

```shell
yarn upgrade
```

This will upgrade all your packages to the latest [wanted](https://docs.npmjs.com/cli/outdated) version, this means the latest patch in case that you specified that only patch updates were allowed, and so on for minor and major update annotations.

## Upgrade individual dependencies

You can also update one package at the time with the install command in npm, or the add command in yarn, alongside the version that you want to install:

```shell
npm install <package-name>@<version> --save
```

```shell
yarn add <package-name>@<version>
```

You can specify the version you want to install or upgrade to, in the following formats:

- An specific version after the @
- An annotated version with \*,^,~ to indicate that you want the latest major, minor or patch release respectively.
- Use and x instead of a number to indicate that you want the latest mayor (x), minor (&lt;major&gt;.x) or patch release (&lt;major&gt;.&lt;minor&gt;.x).

Remember to follow up with the corresponding guide from the [Release and Migrations](https://www.gatsbyjs.org/docs/releases-and-migration/) reference guide overview, for major upgrades.

## Upgrade Interactively

If you are using yarn you can also use the upgrade-interactive command to manually select which dependencies you want to update:

```shell
yarn upgrade-interactive
```

The same behavior can be accomplished in npm through the [npm-check](https://www.npmjs.com/package/npm-check) module. To do that, start by installing the module:

```shell
npm install npm-check --save-dev
```

Then add the corresponding script to your package.json file:

```title=package.json
{
  "scripts": {
    "upgrade-interactive": "npm-check --update"
  }
}
```

And finally run the recently added command:

```shell
npm run upgrade-interactive
```

## Troubleshooting

Aside from some [specific cases](https://www.gatsbyjs.org/blog/2019-06-18-dropping-support-for-node-6/), upgrading for minor or patch releases should not require you to make changes to your code, but it is recommended to run your suite of tests in case you have one after upgrading Gatsby or its dependencies.

In case you get stuck in dependencies conflicts, you can use [selective dependency resolutions](https://yarnpkg.com/lang/en/docs/selective-version-resolutions/) with yarn, or the [npm-force-resolutinos package](https://www.npmjs.com/package/npm-force-resolutions?activeTab=readme) for the same behavior on npm.

## Related content

Check out these related guides for major upgrades of Gatsby:

[Migrating from v0 to v1](https://www.gatsbyjs.org/docs/migrating-from-v0-to-v1/)

[Migrating from v1 to v2](https://www.gatsbyjs.org/docs/migrating-from-v1-to-v2/)
