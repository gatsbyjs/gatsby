---
title: Zero-Configuration Deployments
---

## Introduction

Zero-configuration deployments are powered by [adapters](/docs/how-to/previews-deploys-hosting/adapters/). If you're using one of the [supported deployment platforms](#supported-deployment-platforms) Gatsby will automatically install and use the correct adapter when you deploy your project.

## Prerequisites

- A Gatsby project set up with `gatsby@5.X.0` or later.
- You're using one of the [supported deployment platforms](#supported-deployment-platforms)

## Supported deployment platforms

Gatsby currently supports these platforms for zero-configuration deployments:

- [gatsby-adapter-netlify](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-adapter-netlify) for [Netlify](https://www.netlify.com/)

## Manually installing the adapter

If you plan on staying on a specific deployment platform, consider installing the adapter to your `dependencies`. This will give you faster and more robust installs.

Some adapters might have their own options, in these cases you **need** to manually install the adapter to your `dependencies` if you want to change them. Read the [adapters guide](/docs/how-to/previews-deploys-hosting/adapters/) to learn how to define an adapter.

**Please note:** There is no guarantee for your adapter to be added. Its options (if it has any) must have sensible defaults, it should enable all Gatsby features on that platform, and the platform itself should be relevant.

## Adding additional adapters

Gatsby's zero-configuration deployment setup is controlled through an [adapters.js](https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby/adapters.js) file. If you followed the [Creating an Adapter guide](/docs/how-to/previews-deploys-hosting/creating-an-adapter/) and want to add your adapter to this manifest, you can open a pull request.

## Additional Resources

- [Adapters](/docs/how-to/previews-deploys-hosting/adapters/)
- [Creating an Adapter](/docs/how-to/previews-deploys-hosting/creating-an-adapter/)
