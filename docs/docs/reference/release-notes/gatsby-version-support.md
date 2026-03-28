---
title: "Gatsby Framework Version Support"
---

This page illustrates the support plans for the major versions of Gatsby, allowing you to effectively plan your Gatsby framework upgrades.

Generally, you can expect 1 major version per calendar year, although there may be more than 1 major per year when a necessary evolution of Gatsby requires significant breaking change.

> Future time ranges are listed when a specific target date is not yet determined.

## Support status definitions

**Critical Patch**: A critical patch addresses an issue that prevents the Gatsby framework from delivering intended user value under typical conditions. Other items, such as minor bug fixes and new features, are not considered "critical patches" to Gatsby.

**Active Long-Term Support**: Active Long-Term Support receives priority attention from the core maintainers of Gatsby. New features to Gatsby are only available in the Active Long-Term Supported version.

**Maintenance Long-term Support**: Maintenance Long-term Support receives critical patches, but does not receive new features.

**Unsupported**: This version of Gatsby no longer receives official support of any kind.

| Version | Status                   | As Of             | Until |
| ------- | ------------------------ | ----------------- | ----- |
| 5       | Active Long-term support | November 8, 2022  | TBD   |

## Current recommendation

To receive the newest enhancements and bug fixes, migrate to Gatsby Version 5. Issues can continue to be reported either using support on Gatsbyjs.com, or by opening issues in the GitHub repository.

Your Gatsby-powered sites will continue to run as they do today in Gatsby Cloud. However, as enhancements are delivered within Gatsby Cloud and the Gatsby framework, you may need to upgrade your site(s) in order to take advantage of those features and performance enhancements.

## Node.js version support

Gatsby aims to support any version of Node that has a release status of Current, Active, or Maintenance. Once a major version of Node reaches End of Life status, Gatsby will stop supporting that version.

Gatsby will stop supporting the End of Life Node release in a minor version.

Gatsby 5 drops support for Node 14 and 16 as the currently supported Node 14 version will reach EOL during the Gatsby 5 lifecycle. Since the timing of the "Active LTS" status of Node 18 is nearly the same as Gatsby 5, it jumps directly to Node 18.

Generally it's recommended to use the Node version whose status is Active LTS.
