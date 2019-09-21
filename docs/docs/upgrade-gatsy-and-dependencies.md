---
title: How to upgrade Gatsby and dependencies for minor/patch releases
---
## Introduction
To keep up with the latest bug fixes, security patches and minor releases from both Gatsby and its dependencies, you should constantly upgrade to the latest version of each one.
In this guide you will learn how to update Gatsby and its dependencies for minor or patch releases.

## Semantic versioning
As many oother pacakages, Gatsby uses [semantic versioning](https://semver.org/) to tag newest releases and indicate what kind of changes are introduced in every new release.

This guide is ment to teach you how to upgrade Gatsby for minor or patch releases. For major changes you can search on our [Release and Migrations](https://www.gatsbyjs.org/docs/releases-and-migration/) reference guide overview for the corresponding guide to upgrade.

## Why you should upgrade Gatsby and its dependencies
Every new version of every package comes with improvements on multiple categories from performance, accesibility, to security and bug fixes, among otthers, so it is important for you to upgrade both Gatsby and its dependencies to get the latest in every one of these categories.

Constantly upgrading your dependencies on minor or patches releases also helps you to make major upgrades easier and to identify possible deprecated functionality or APIs.

## How to identify new versinos for Gatsby and its dependencies.
Depending on your current setup, you can use both yarn or npm to update your dependencies. You can run the outdated command to identify new releases for all your dependencies. Remember that you only have to use one of npm or yarn, not both of them. 

```shell
npm outdated
```

```shell
yarn outdated
```

This will output a table indicating which packages have new versonis available and what is the latest version per each one.   

```
Package                            Current   Wanted   Latest  Location
gatsby                             2.15.13  2.15.13  2.15.20  
```


## Indicate the kind of update you want

Depending on wether you want to update Gatsby and its dependencies for minor or patch releases you will modify your `package.json` accordingly. If you only want to update only for patch releases, you can add a tilde before the version of your package:

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

In case that you are updating Gatsby, be sure to also update Gatsby related plugins, you can identify them because their name start with `gatsby-`, this only applies to plugins managed in the gatsbyjs/gatsby repo, for community plugins check beforehand if there is a new version before trying to update.

## Updating all your dependencies at once
After adding the corresponding anotations into your `package.json` file, you can run the update to command in npm or the upgrade command if you are using yarn, remember that you only have to use one of yarn or npm:

```shell
npm update
```

```shell
yarn upgrade
```

This will all your packages to the latest *wanted* version, this means, the latest patch in case that you specified that only patch updates were allowed, and so on for minor and major updates.

## Alternative ways to update your dependencies

You can also update one package at the time with the install command in npm, or the add command in yarn, alongside the version that you want to install:

```shell
npm install <pkg>@<version> --save
```

```shell
yarn add <pkg>@<version>
```

You can specify the version in the following formats:
- An specific version afther the @
- An annotated versoin with *,^,~ to indicate that you want the latest major, minor or patch release respectively.
- Usa and x instead of a number to indicate that you wnat the latest mayor (x), minor (<major>.x) or patch release (<major>.<minor>.x).

Remember follow up with the corresponding guide from the [Release and Migrations](https://www.gatsbyjs.org/docs/releases-and-migration/) reference guide overview, for major upgrades.

If you are using yarn you can also use the upgrade-interactive command to manually select which dependencies you want to update:

```shell
yarn upgrade-interactive
```
The same behavior can be accomplished in npm through the npm-check module. To do that, start by installing the module:

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
