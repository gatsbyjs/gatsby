---
title: Investigating Build Performance At Scale
date: "2018-06-24"
author: "Sam Bhagwat"
tags: ["scalability", "builds"]
---

When website teams are deciding whether to migrate an existing site over to Gatsby, one consideration is how long it takes to rebuild each site when code or content changes.

In order to help teams evaluate this, we’re publishing a set of build time benchmarks.

# Performance Considerations

Generally speaking, Gatsby build times consist of two factors -- O(1) constant-time operations, such as connecting to remote APIs, and O(n) linear-time operations, such as processing markdown pages, transforming images, and so on.

On smaller sites, O(1) constant time operations take up most of the time “cost” of building a Gatsby site. On larger sites, O(n) linear-time operations predominate. Generally, larger sites tend to be CPU-bound rather than I/O-bound, so a more powerful server, VM, or container will finish quicker.

The three most memory-intensive operations that scale with site size are **processing markdown**, **creating pages**, and **processing images with gatsby-image**.

# Benchmark Parameters

_Site tests_

In order to measure the “build performance cost” of each of these three factors, we’ve benchmarked Gatsby build times for two different sites, one image-heavy and one markdown-page heavy.

The first site is [FreeCodeCamp’s Guide](https://github.com/freeCodeCamp/guide), one of the largest open-source Gatsby sites with around 3,000 pages. The second site is the using-gatsby-image official example [copied into its own repo](https://github.com/calcsam/gatsby-image-performance-benchmarking). We’ve run two different versions of this: first, with around 25 images and second, with around 250 images. Both sites are running on Gatsby v2.

Note that **using gatsby-image is not a requirement to use Gatsby**. If you have enough images that image-processing-driven build times is impeding project goals or team workflows, consider simply removing (or not implementing) gatsby-image.

_Machine types_

Tests were run on three different machines; on a local development machine (2015 Macbook Pro), on an AWS t2 micro free tier instance, and an AWS memory-optimized m4 instance.

_Cold start vs warm start_

Tests were run both with (“warm start) and without (“cold start”) a pre-existing, local Gatsby cache.

In most cases when code changes and all cases when content changes, Gatsby will preserve the cache from your previous build, giving you a warm start. The cache is only invalidated in rare instances, for example when the plugin changes.

Whether you’re able to access the cache from previous builds depends on your CI setup, but many CI providers offer the option of preserving the previous build cache.

# Results

For cold start builds, each additional markdown page adds around **0.17 seconds**, while each additional image processed with gatsby-image adds **between 1.5 and 2.1 seconds** to fresh Gatsby builds.

For warm start builds, each additional markdown page adds **around 0.07 seconds**, while additional images processed with gatsby-image are free.

Full results are [linked](https://docs.google.com/spreadsheets/d/1ki5PwVTnIyycsk800DSWIA72UAr1k1DUJnKCf_lWz4c/edit#gid=0), along with our [build script](https://gist.github.com/calcsam/4aa066a46d74b6713c053a6adc0e0f76).

# Next steps

Gatsby users report that Gatsby builds fail due to running against hard Node.js process memory limits somewhere around 10,000 to 15,000 pages on v1.

Since v2 has improved memory usage, we want to update this number, as well as further quantify the boundary so that teams considering migrating larger sites to Gatsby have more information for their decision-making.

We also want to benchmark v2 build performance against v1 build performance for various sites.
