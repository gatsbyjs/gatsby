---
title: Introducing the Gatsby Starter Showcase
date: "2018-06-30"
author: "@swyx"
tags: ["gatsby", "starters"]
---

TL;DR: We are proud to announce [a dedicated showcase](https://dreamy-shannon-191f15.netlify.com/starter-showcase/) for you to search, filter, and share Gatsby starters!

Starters are an important part of how many people experience Gatsby for themselves for the first time. To get started with a new Gatsby project from scratch, we recommend using [the Gatsby command line tool](https://www.gatsbyjs.org/docs/) and using the `gatsby new [SITE_DIRECTORY]` command, which makes a new folder with your supplied SITE_DIRECTORY name and installs the minimal required dependencies. Sometimes you want more than that, so we have the concept of "starters" which are essentially boilerplate Gatsby sites maintained by the community. To install a starter, you type `gatsby new [SITE_DIRECTORY] [URL_OF_STARTER_GITHUB_REPO]` and the CLI does the rest.

To be extra clear (because I was confused about this in the past): every Gatsby project can be a starter. `gatsby new` is not much different from `git clone && rm -rf .git/ && yarn`

Although Gatsby maintains only [three official starters](https://dreamy-shannon-191f15.netlify.com/starter-showcase/?c=official), as the project grew over time many people added their own to [the list of starters](https://www.gatsbyjs.org/docs/gatsby-starters/) in the docs. Searchability and discoverability became a problem. So the idea for a [Starter Showcase](https://github.com/gatsbyjs/gatsby/issues/5334) was born.

# Features

The Starter Showcase is essentially a list-and-detail view. On the main page we list all 60 (at time of writing) available starters. You can filter by Categories or by Gatsby Dependencies, or just type what you want into the search box on the top right. If you click on any starter you are taken to a detail page where you can see more descriptions and features, click through to see the source code, as well as browse the list of dependencies. If you like any you should try them out on Netlify or share them in the social links!

A few details bear mentioning:

- Most of the Starter data is manually submitted, which means we are relying on the starter maintainer to self-report what Categories, description, and Features are demonstrated by the starter.
- Screenshots and Github metadata are periodicially crawled, so we automatically scrape useful info like the `package.json`, Github stars, and `lastUpdated` fields from Github directly.
- The URL bar contains the state of the search/filters, so you can feel free to share or bookmark filters you like. We have used this to great effect, for example to highlight the quality starters created by community members like [LekoArts](https://dreamy-shannon-191f15.netlify.com/starter-showcase/?s=lekoarts) or to implement the new [See Starters that Use This](https://dreamy-shannon-191f15.netlify.com/packages/gatsby-plugin-sharp/?=) feature in the Plugin Library.

This is certainly an MVP more than a final version, so if you have more ideas on what we can do in the Starter Showcase, please [comment on Github](https://github.com/gatsbyjs/gatsby/issues/5334)! For example, one debate we wrestled with was: should starters be judged based on how they look, or what dependencies they implement for you? These are deep design questions we have punted on but may revisit in future.

# Submit Your Starter

We believe the Starter Showcase has helped improved searchability and discoverability for Gatsby Starters, and with this we are ready to onboard a lot more starters going forward. I personally would love to see multiple starters that show how to use every plugin! [Submit yours today!](https://github.com/gatsbyjs/gatsby/issues/new/choose)
