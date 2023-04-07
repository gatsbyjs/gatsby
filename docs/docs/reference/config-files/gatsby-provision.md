---
title: Gatsby Provision Convention
description: Documentation on the Gatsby Provision configuration convention
---

## Introduction

Gatsby Provision (`gatsby-provision`) is a configuration standard for Gatsby websites used for specifying a script which will provision data models and data associated with the Gatsby site.

This document will give an overview of the convention requirements, provide links to existing `gatsby-provision-*` packages as well as a suggest guidelines for those looking to author their own Gatsby Provision package.

## Overview

The goal of the `gatsby-provision` convention is to provide a standardized manner with which Gatsby sites can populate content into an accompanying data source. A typical use case would be if you're building a Gatsby Starter, or a boilerplate or template site for your own re-use.

The generated content could be anything from markdown files, to creating a new database, to populating a CMS — but usually it will involve interacting with third parties which require some means of authentication.

Another goal of this standardization is to enable deployment of a Gatsby site in Gatsby Cloud without requiring a pre-requisite step of setting up the data source(s).

In short, in order to implement the `gatsby-provision` convention, your site should:

- Include a `gatsby-provision-*` package as a `devDependency`
- Have an npm script named `gatsby-provision` in your site's `package.json` file which invokes the `gatsby-provision-*` package with any required arguments.

## Existing packages

Currently there exists the following packages that can be used to provision content in their respective systems / vendors:

- `gatsby-provision-contentful` - [README](https://github.com/gatsbyjs/gatsby-provision-contentful)
- `gatsby-provision-sanity` - [README](https://github.com/gatsbyjs/gatsby-provision-sanity)

See the associated README link for usage details for each package.

## Building your own

Given the context and examples above, if you're reading this section, you probably already have an idea of what logic your Gatsby Provision script should contain. However, there are some common aspects to what a `gatsby-provision` script should be designed to adhere to:

- Be able to execute the CLI package by name — if you are unfamiliar, here is a good [article on how to build a CLI with Node](https://dev.to/rushankhan1/build-a-cli-with-node-js-4jbi)
- Work both locally and in Gatsby Cloud, discerning between the two contexts via an environment variables named `GATSBY_CLOUD`. When the script is ran in Gatsby Cloud, the following statement will resolve as true: `process.env.GATSBY_CLOUD === "true"`
- Utilize a combination of bash arguments and environment variables to source dynamic values the script requires
- In the local context, it should write out or amend a `.env` / `.env.development` / `.env.production` file(s) with any values (API tokens, CMS namespaces, etc.) that will be required environment variables for the site to build
- In the local context, for a better developer experience consider using an interactive CLI tool such as `inquirer` - [inquirer on npm](https://www.npmjs.com/package/inquirer)
- In Gatsby Cloud context, ensure there are no interactive prompts, as the user will not have the ability to interact
- Log out errors if any required arguments or environment variable values are not defined, as well as an explicit call to `process.exit(1)` in any error handling

For additional detail and examples, you can see these aspects adhered to in the existing packages linked above.
