---
title: How to Make a Reproducible Build
---

One way to try to dig down at resolving an issue is to have a demo project that shows off just the singular issue at hand. If you are able to, you could link the repo that the bug is found in, but it is easier to tackle the bug with a reproducible build instead so you have a lot less surface area to tackle.

A reproducible build is a reproduction of a problem in a much smaller context so other developers can reproduce the bug in a more narrow codebase rather than an entire application.

## Steps to create a reproducible build

- Start up a Gatsby site with a starter.
- Add the plugins specific to the issue. (If you are having something go wrong with gatsby-MDX, load in the related MDX plugins, but don't load in the other plugins you don't need that may also be in your actual site)
- Add the code to show the error
- Push up the code and then link it when [creating an issue](/contributing/how-to-file-an-issue/).

## Places to develop a reproducible build

- Locally with a starter: We can start out with a [Starter](/docs/starters) locally and then build it on your own machine.
- Host on CodeSandbox: CodeSandbox has a [Gatsby template](https://codesandbox.io/s/github/gatsbyjs/gatsby-starter-default) which you can develop a site up online without needing to download anything. Then you can link a URL to the project and have a live application of your issue all in the browser.

## Benefits of Reproducible Builds

- Smaller surface area: By removing everything but the error, you don't have to dig to find the bug.
- Don't have to expose client code: The site may be under an NDA so sharing an entire site may not be possible. remaking it in a reproducible build fixes this.
- Proof of the bug: Rather than having an instance where you say there's a bug on your machine, contributors can pull down a repo and test it on their machines as well.
