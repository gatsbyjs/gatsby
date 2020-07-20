---
title: Basic Hardware and Software Requirements
---

Find the latest hardware and software requirements for building with Gatsby. Note: this doc will evolve as the framework evolves, so if you find something that's outdated please [open an issue with your findings](/contributing/how-to-file-an-issue/).

## Operating Systems

- macOS Sierra or later (10.12)
- Windows 10 ([setup instructions](/docs/gatsby-on-windows/))
- Linux ([multiple distributions](/docs/gatsby-on-linux/))

## Memory

This will be variable depending on the size of your site. Gatsby sites have been known to work from 500mb to 1GB of RAM.

## Node.js ecosystem

To develop with Gatsby, you'll need to install:

- Node.js 10.13.0 (LTS) or higher
- [npm](https://www.npmjs.com/) or [Yarn 1](https://classic.yarnpkg.com/lang/en/) package manager to install the [Gatsby CLI](/docs/gatsby-cli/) and site dependencies.
  - npm is recommended for most developers.
  - Yarn is used for authoring Gatsby themes.
  - Yarn is also used for developing Gatsby itself, as well as its websites.
  - Note: while Yarn 2 should work with Gatsby's core plugins, some 3rd-party plugins do not.
  - There's a [command to tell the Gatsby CLI which package manager to use](/docs/gatsby-cli/#how-to-change-your-default-package-manager-for-your-next-project).

It's possible to use Gatsby without the CLI, which relies on public GitHub access. [See docs for more info](/docs/setting-up-gatsby-without-gatsby-new/).

## Browser versions

- This is the same as [React DOM](https://reactjs.org/docs/react-dom.html#browser-support), as Gatsby uses React to build websites.
  - IE9+ (with polyfills) and popular modern browsers.
- See more on [browser support](/docs/browser-support/).
