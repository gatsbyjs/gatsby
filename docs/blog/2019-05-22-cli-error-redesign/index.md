---
title: Lions and Tigers and Errors, Oh My! Redesigning the Gatsby CLI
date: 2019-05-22
author: Shannon Soper
tags:
  - cli
  - user-testing
  - deverloper-experience
---

## Why did we do this study?

Our command-line interface (CLI) is OK but not great. It will be useful to generate a set of design principles to base the CLI around — but not change what's working well (which is a lot of it). So let’s do it!

The CLI is the main entry point and interface people have (currently) for Gatsby. Everyone sees it! So it has a huge influence on people’s experience of Gatsby.

We’re going to create a CLI style guide and then implement that style guide, which includes redesigning error messages, introducing `gatsby --quiet` as a default mode and make more extensive use of the `gatsby --verbose` flag. To make the CLI easier to design and improve, we’ll implement [Ink](https://github.com/vadimdemedes/ink). To optimize the CLI design, we’ll use the data being collected through our telemetry setup, which collects data about CLI usage (opt out is possible).

## What did we learn?

We conducted 4 usability tests with awesome Gatsby users to learn how they do tasks using the Gatsby CLI and how they use error messages to debug their projects. Thanks [Simon Koelewijn](https://github.com/smnk), [Gene Smith](https://twitter.com/gene_r_smith), [Jonathan Prozzi](https://github.com/jonathanprozzi), and [Benjamin Lannon](https://github.com/lannonbr) for teaching us how you use the CLI, and thanks to [@sidharthachatterjee](https://github.com/sidharthachatterjee), [@wardpeet](https://github.com/wardpeet), [@pieh](https://github.com/pieh), [@m-allanson](https://github.com/m-allanson), [@gillkyle](https://github.com/gillkyle) for copiloting the interviews with me and helping turn what we learned into action.

If you want to be part of future usability tests, [sign up here](https://mailchi.mp/84f6243ba763/gatsby-usability-newsletter-signup).

We also did a thorough search of other CLIs and style guides to learn what we're doing well and where we might be falling short. Here are resources that informed our knowledge of problems that Gatsby CLI has and possible ways to solve those problems:

- [Evaluation of other CLI tools](https://github.com/gatsbyjs/gatsby/issues/12951)
- [Nielsen Norman Group 10 usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
- [Nielsen Norman Group error message design](https://www.nngroup.com/articles/error-message-guidelines/)
- [Heroku CLI style guide](https://devcenter.heroku.com/articles/cli-style-guide)
- [12 Factor CLI Apps](https://medium.com/@jdxcode/12-factor-cli-apps-dd3c227a0e46)
- [User journey through the Gatsby CLI](https://whimsical.co/2PxMcRGE63bwk1Ayc3emAB) (informed by usability interviews and the Gatsby core team’s observations of what issues are most common regarding the CLI)

## What do we need to do?

1.  Crunch some numbers to find out "what are the most common error messages people get?"
2.  Make error messages better, starting with the most common ones
3.  Create a CLI style guide and make sure the CLI starts matching the style guide
4.  Do some other things that will make the CLI easier to use (easier = takes less time to do a task and/or is less frustrating). See [issues tagged with `topic: cli`](https://github.com/gatsbyjs/gatsby/issues?q=is%3Aopen+is%3Aissue+label%3A%22topic%3A+cli%22) in the OSS repo!

## Want to dive in and help / comment?

Get consensus on the [Error Survey RFC](https://github.com/gatsbyjs/rfcs/pull/37) & [CLI Redesign RFCs](https://github.com/gatsbyjs/rfcs/pull/38) start on the changes they suggest!

All the related issues will be [tagged with `topic: cli`](https://github.com/gatsbyjs/gatsby/issues?q=is%3Aopen+is%3Aissue+label%3A%22topic%3A+cli%22) in the OSS repo.

List of issues (some already have PRs in progress):

- [with `gatsby new`, users have options to select one of three default starters or visit the starter library](https://github.com/gatsbyjs/gatsby/issues/14085)
- [Redirect and/or accept multiple options for localhost addresses](https://github.com/gatsbyjs/gatsby/issues/14084)
- [Clear screen to show only relevant information after `gatsby develop` in the CLI](https://github.com/gatsbyjs/gatsby/issues/13513)
