---
title: Migrating from v4 to v5
---

Looking for the [v3 docs](https://v3.gatsbyjs.com)?

> Have you run into something that's not covered here? [Add your changes to GitHub](https://github.com/gatsbyjs/gatsby/tree/master/docs/docs/reference/release-notes/migrating-from-v3-to-v4.md)!  

## Introduction

This is a reference for upgrading your site from Gatsby 4 to Gatsby 5. 

## Table of Contents

- [ ] TBA

## Handling Deprecations

Before upgrading to v5 we highly recommend upgrading `gatsby` (and all plugins) to the latest v4 version.
Some changes required for Gatsby 5 could be applied incrementally to the latest v4 which should contribute to smoother upgrade experience.

> Use `npm outdated` or `yarn upgrade-interactive` for automatic upgrade to the latest v3 release.  

After upgrading, run `gatsby build` and look for deprecation messages in the build log.
Follow instructions to fix those deprecations.

## Updating Your Dependencies

Next, you need to update your dependencies to v5.

### Update Gatsby version

You need to update your `package.json` to use the `latest` version of Gatsby.

```json:title=package.json
{
  "dependencies": {
    "gatsby": "^5.0.0"
  }
}
```

Or run

```shell
npm install gatsby@latest
```

Please note: If you use npm 7 you'll want to use the `--legacy-peer-deps` option when following the instructions in this guide. For example, the above command would be:

```shell
npm install gatsby@latest --legacy-peer-deps
```

### Update Gatsby related packages

Update your `package.json` to use the `latest` version of Gatsby related packages. You should upgrade any package name that starts with `gatsby-*`. Note, this only applies to plugins managed in the [gatsbyjs/gatsby](https://github.com/gatsbyjs/gatsby) repository. If you're using community plugins, they might not be upgraded yet. Please check their repository for the current status.

#### Updating community plugins

Using community plugins, you might see warnings like these in your terminal:

```shell
warning Plugin gatsby-plugin-acme is not compatible with your gatsby version 5.0.0 - It requires gatsby@^4.10.0
```

If you are using npm 7, the warning may instead be an error:

```shell
npm ERR! ERESOLVE unable to resolve dependency tree
```

This is because the plugin needs to update its `peerDependencies` to include the new version of Gatsby (see section [for plugin maintainers](#for-plugin-maintainers)). While this might indicate that the plugin has incompatibilities, in most cases they should continue to work. When using npm 7, you can pass the `--legacy-peer-deps` to ignore the warning and install anyway. Please look for already opened issues or PRs on the plugin's repository to see the status. If you don't see any, help the maintainers by opening an issue or PR yourself! :)

## Handling Breaking Changes

This section explains breaking changes that were made for Gatsby 4. Some of those changes had a deprecation message in v3. In order to successfully update, you'll need to resolve these changes.

### Minimal Node.js version 16.x.x

We are dropping support for Node 14 as a new underlying dependency (`something-something`) is requiring `>=16.x.x`. See the main changes in [Node 16 release notes](https://nodejs.org/en/blog/release/v16.0.0/).

Check [Node’s releases document](https://github.com/nodejs/Release#nodejs-release-working-group) for version statuses.

### Breaking change 1
…
### Breaking change 1


### Gatsby related packages

Breaking Changes in plugins that we own and maintain.

#### `gatsby-plugin-sitemap`

- [ ] Change default to generate file at root, not inside `/sitemap` folder
- [ ] Optional: Give option to not create index file + sitemaps but only single sitemap.xml file

#### `package-2`


## Future Breaking Changes

This section explains deprecations that were made for Gatsby 5. These old behaviors will be removed in v6, at which point they will no longer work. For now, you can still use the old behaviors in v4, but we recommend updating to the new signatures to make future updates easier.

### `something` is deprecated


## For Plugin Maintainers

In most cases, you won't have to do anything to be v5 compatible. The underlying changes mostly affect source plugins. But one thing you can do to be certain your plugin won't throw any warnings or errors is to set the proper peer dependencies.

Please also note that some of the items inside "Handling Breaking Changes" may also apply to your plugin.

`gatsby` should be included under `peerDependencies` of your plugin and it should specify the proper versions of support.

```diff:title=package.json
{
  "peerDependencies": {
-   "gatsby": "^4.0.0",
+   "gatsby": "^5.0.0",
  }
}
```

If your plugin supports both versions:

```diff:title=package.json
{
  "peerDependencies": {
-   "gatsby": "^2.32.0",
+   "gatsby": "^4.0.0 || ^5.0.0",
  }
}
```

If you defined the `engines` key you'll also need to update the minimum version:

```json:title=package.json
{
  "engines": {
    "node": ">=16.x.x"
  }
}
```

You can also learn more about this in the [migration guide for source plugins](/docs/reference/release-notes/migrating-source-plugin-from-v3-to-v4/).

## Known Issues

This section is a work in progress and will be expanded when necessary. It's a list of known issues you might run into while upgrading Gatsby to v5 and how to solve them.

If you encounter any problem, please let us know in this [GitHub discussion](https://github.com/gatsbyjs/gatsby/discussions/32860).
