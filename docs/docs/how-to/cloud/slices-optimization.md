---
title: "Enable Slices API Optimizations"
description: "Learn how to optimize your Slices on Gatsby Cloud."
---

> Support for the Gatsby Slice API was added in `gatsby@5.0.0`. Check the status of the Gatsby 5 release in our [Github Discussion](https://github.com/gatsbyjs/gatsby/discussions/36609).

[Incremental Builds](https://www.gatsbyjs.com/blog/2020-04-22-announcing-incremental-builds/) helped build your site faster. The [Slice API](/docs/reference/built-in-components/gatsby-slice) pushes your build speeds even further for common UI components. Learn how to use the Slice API in our [How-to doc](docs/docs/how-to/performance/using-slices.md).

## Cloud Optimizations

By using Slices, Gatsby Cloud can optimize your builds even further by enabling the checkbox in your Build Features settings.

![Slices API toggle in Gatsby Cloud](../../images/slices-api-optimization.png)

By knowing which pieces of your site to build and host, we can increase build times on Slice changes by up to 90%.

These optimizations for Slices requires [Fast Hosting](/docs/docs/how-to/cloud/fast-hosting).
