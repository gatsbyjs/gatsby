---
title: How to Make a Minimal Reproduction
---

## What is a reproducible test case?

A reproducible test case is a small Gatsby site built to demonstrate a problem - often this problem is caused by a bug in Gatsby, Gatsby plugin or user code. Your reproducible test case should contain the bare minimum features needed to clearly demonstrate the bug.

## Why should you create a reproducible test case?

A reproducible test case lets you isolate the cause of a problem, which is the first step towards fixing it!

The [most important part of any bug report](https://developer.mozilla.org/en-US/docs/Mozilla/QA/Bug_writing_guidelines#Writing_precise_steps_to_reproduce) is to describe the exact steps needed to reproduce the bug.

A reproducible test case is a great way to share a specific environment that causes a bug. Your reproducible test case is the best way to help people that want to help _you_.

## Steps to create a reproducible test case

- Create a new Gatsby site with the official `gatsby-starter-minimal` starter: `npx gatsby new bug-repro https://github.com/gatsbyjs/gatsby-starter-minimal`
- Add any Gatsby plugins that relate to the issue. For example, if you're having problems with MDX you should install and configure [`gatsby-plugin-mdx`](/plugins/gatsby-plugin-mdx/). Only add plugins that are needed to demonstrate the problem.
- Add the code needed to recreate the error you've seen.
- Verify that you're seeing the expected error(s) when running `gatsby develop`/`gatsby build`/`gatsby serve`.
- Publish the code (your GitHub account is a good place to do this) and then link to it when [creating an issue](/contributing/how-to-file-an-issue/) or opening a support ticket. While creating the issue/support ticket, please give as many details as possible. This could also include screenshots of error message in e.g. the terminal or browser.

### Optional steps

Sometimes it might be necessary that you share additional information with the team, e.g. when [Gatsby Cloud](/products/cloud/builds) or a CMS is involved. Here are some optional steps you can take in improving your minimal reproduction:

- If your Gatsby Cloud build failed, copy the URL and share it with us. If a live URL is misbehaving, also copy that specific URL and describe which behavior you're expecting and what behavior you're actually seeing. Screenshots or videos about problems on your site are also appreciated.
- If your reproduction requires a successful connection to a CMS to build and show the error, please set up a non-production environment for that CMS that we then can use. You can do this by e.g. setting up a new instance from scratch and filling it with some content. In case that's not possible, please provide specific instructions on how we can use your production environment.

## Online Development Environments

Instead of cloning `gatsby-starter-minimal` to your local computer and working on it there, you can also use Online IDEs that set up the environment for you. Available options:

- [CodeSandbox](https://githubbox.com/gatsbyjs/gatsby-starter-minimal)
- [StackBlitz](https://githubblitz.com/gatsbyjs/gatsby-starter-minimal)

## Benefits of reproducible test cases

- Smaller surface area: By removing everything but the error, you don't have to dig to find the bug.
- No need to publish secret code: You might not be able to publish your main site (for many reasons). Remaking a small part of it as a reproducible test case allows you to publicly demonstrate a problem without exposing any secret code.
- Proof of the bug: Sometimes a bug is caused by some combination of settings on your machine. A reproducible test case allows contributors to pull down your build and test it on their machines as well. This helps verify and narrow down the cause of a problem.
- Get help with fixing your bug: If someone else can reproduce your problem, they often have a good chance of fixing the problem. It's almost impossible to fix a bug without first being able to reproduce it.
