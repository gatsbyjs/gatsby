---
title: "Dropping Support for Node 8"
date: 2020-03-20
author: Mikhail Novikov
excerpt: "We're dropping support for Node 8 in minor releases of core Gatsby packages."
tags:
  - releases
---

Effective in Gatsby v2.20.0, we are making a potentially breaking change and dropping support for Node 8. The new minimal Node version that Gatsby supports is 10.13.0. We are doing it in a minor release as per [Gatsby Node Support Policy](https://www.gatsbyjs.org/docs/upgrading-node-js/#gatsbys-nodejs-support-policy).

Node 8 has reach end of life in December of 2019. There were deprecation warnings about it in previous Gatsby versions. Less than 3% of Gatsby users are still using Node 8. Some libraries that Gatsby or Gatsby plugins depend on have dropped Node 8. We feel there is no point in supporting it, especially since some nice performance improvement are locked behind Node 10.

# How will it affect me?

You should fine if you have already upgraded your Node version to 10.13.0 or higher, you won't be affected.

Otherwise follow the [Upgrading your Node guide](https://www.gatsbyjs.org/docs/upgrading-node-js).
