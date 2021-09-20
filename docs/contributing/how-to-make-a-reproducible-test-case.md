---
title: How to Make a Minimal Reproduction
---

## What is a reproducible test case?

A reproducible test case is a small Gatsby site built to demonstrate a problem - often this problem is caused by a bug in Gatsby or a Gatsby plugin. Your reproducible test case should contain the bare minimum features needed to clearly demonstrate the bug.

## Why should you create a reproducible test case?

A reproducible test case lets you isolate the cause of a problem, which is the first step towards fixing it!

The [most important part of any bug report](https://developer.mozilla.org/en-US/docs/Mozilla/QA/Bug_writing_guidelines#Writing_precise_steps_to_reproduce) is to describe the exact steps needed to reproduce the bug.

A reproducible test case is a great way to share a specific environment that causes a bug. Your reproducible test case is the best way to help people that want to help _you_.

## Steps to create a reproducible test case

- Create a new Gatsby site with a starter, the official `hello-world` starter is a great 'barebones' starting point here: `gatsby new bug-repro https://github.com/gatsbyjs/gatsby-starter-hello-world`
- Add any Gatsby plugins that relate to the issue. For example, if you're having problems with Gatsby MDX you should install and configure [`gatsby-plugin-mdx`](/plugins/gatsby-plugin-mdx/). Only add plugins that are needed to demonstrate the problem.
- Add the code needed to recreate the error you've seen.
- Publish the code (your GitHub account is a good place to do this) and then link to it when [creating an issue](/contributing/how-to-file-an-issue/).

## Places to develop a reproducible test case

- Locally with a starter: You can start with a [Starter](/docs/starters) locally and then build it on your own machine. Gatsby's official [`hello-world`](https://github.com/gatsbyjs/gatsby/tree/master/starters/hello-world) or [`default`](https://github.com/gatsbyjs/gatsby-starter-default) starter are both good foundations for a reproducible test case.
- Host on CodeSandbox: You can develop a Gatsby site straight from your browser with CodeSandbox using their [Gatsby template](https://codesandbox.io/s/github/gatsbyjs/gatsby-starter-default). CodeSandbox also hosts your site automatically, which can be useful to demonstrate the behavior of your site.

## Benefits of reproducible test cases

- Smaller surface area: By removing everything but the error, you don't have to dig to find the bug.
- No need to publish secret code: You might not be able to publish your main site (for many reasons). Remaking a small part of it as a reproducible test case allows you to publicly demonstrate a problem without exposing any secret code.
- Proof of the bug: Sometimes a bug is caused by some combination of settings on your machine. A reproducible test case allows contributors to pull down your build and test it on their machines as well. This helps verify and narrow down the cause of a problem.
- Get help with fixing your bug: If someone else can reproduce your problem, they often have a good chance of fixing the problem. It's almost impossible to fix a bug without first being able to reproduce it.
