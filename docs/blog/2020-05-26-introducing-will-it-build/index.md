---
title: ‘Introducing Will It Build: A new builds benchmarking service for Gatsby Cloud’
date: 2020-05-26
author: Shannon Soper
excerpt: ‘The first -- and only -- publicly available static site benchmarking service, Will It Build demonstrates the progress of build times for sample Gatsby benchmark sites on Gatsby Cloud. Thanks to our new Incremental Builds feature, data and content changes now go from edit to live in seconds! See for yourself: all of our data can be queried right on the site using our exposed GraphQL API at willit.build/api-playground.’
tags:
  - willitbuild
  - gatsby-cloud
  - incremental-builds
  - performance
---

## The first -- and only -- publicly available static site benchmarking service

Today we are thrilled to announce that [Will It Build](https://willit.build/) is live! This benchmarking website lets you view and compare build times for Gatsby-built websites and applications on Gatsby Cloud.

Will It Build demonstrates the progress of build times for sample Gatsby benchmark sites on Gatsby Cloud. We prototyped some generic versions of the many types of sites that can be built with Gatsby, from basic developer blog to large social network with an image on every page, using multiple popular CMS's and content sources. Currently we are showing results for Wordpress, Contentful, Drupal, and DatoCMS as well as sites using MDX and Markdown as the data source. (We will be adding more, so contact <mailto:partners@gatsbyjs.com> to get the guide for how to create a benchmark for your CMS or service!)

For those curious as to how it all works, we have open sourced [the example benchmark sites](https://github.com/gatsbyjs/gatsby/tree/master/benchmarks) as well as [the benchmark plugin](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-benchmark-reporting) that reports back the results. Additionally, all of our data can be queried right on the site using our exposed GraphQL API at [willit.build/api-playground](https://willit.build/api-playground).

One of the coolest things about WIllit.build is how clearly it shows the drastic reduction in build times that our new [Incremental Builds](https://www.gatsbyjs.org/blog/2020-04-22-announcing-incremental-builds/) feature makes possible on Gatsby Cloud:

![](https://lh3.googleusercontent.com/9bzilTs1JiTr_VGOuDktdNZ4G-GxBKxot1nX4fdXngUo-CDVrQMSmdaUMnJM7w_Loj6-ncxuv71ebaC5h0_g56tSL6tP6P8P2OxWyA_SbczAFMnc0LLgQkdw35ffuEFvfYUAfk3p)

## Three types of builds (fast, faster, fastest)

It's also a nifty way to demonstrate the three different types of builds that happen with a static website. With Gatsby, different situations can lead to radically different build times. Not all updates are equal, and Will It Build was created in part to benchmark the different types.

1. **Uncached/Code changes:** Initial site builds are always going to take the longest time to build, because Gatsby Cloud needs to establish a baseline build and create the cache. Any time you push a code change through source control like GitHub, that will also trigger a full rebuild. These take the longest (but since many sites don't change their source code all that frequently it's not a huge issue). Even so, Gatsby sites are already optimized for fast builds no matter where they run...though they build fastest on Gatsby Cloud's specialized infrastructure.

2. **Cached code changes:** These are changes that make use of an available cache and don't require the full rebuild. Much faster!

3. **Data change from CMS (a.k.a Incremental Builds):** A data change is a tweak made through the CMS (eg. Contentful). For example when a content editor publishes a new article or fixes a typo, this represents a data change because the codebase itself hasn't changed. Since the initial build is already established, subsequent incremental builds can run a comparison against it to determine what has changed. These builds are the fastest of all and only available on Gatsby Cloud.

What are you still doing here? Get on over to [Willit.build](https://willit.build/) and try it out for yourself
