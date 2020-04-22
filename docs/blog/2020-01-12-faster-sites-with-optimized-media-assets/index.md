---
title: "Faster Sites with Optimized Media Assets"
date: 2020-03-02
author: William Imoh
excerpt: "Introducing two new Gatsby-Cloudinary plugins for optimized media management in Gatsby apps"
tags: ["media", "cloudinary", "performance", "image", "video"]
---

Plugins are at the heart of developing software with Gatsby because they not only extend Gatsby’s robust features but also make available, data from multiple sources. I’m excited to introduce you to two Gatsby plugins: [gatsby-source-cloudinary](/packages/gatsby-source-cloudinary/) and [gatsby-transformer-cloudinary](/packages/gatsby-transformer-cloudinary/).

Cloudinary is a cloud-based end-to-end media management platform for many of the world's top brands. With extensive product offerings from an Image management solution, Dynamic Video Platform, and a dynamic digital asset management solution.

## The Motivation Behind the Scenes

The two open-source Gatsby-Cloudinary plugins combine the best of both worlds:

- Gatsby builds high-performance sites with data from multiple sources and fetches declarative data with GraphQL, offering a superior developer experience and a rich ecosystem for developing in ReactJS.
- Cloudinary is an advanced media-management service that offers three key features:
  - Optimized media storage and delivery
  - Media transformation on data query and on the fly with dynamic URLs
  - Digital-asset management for high performance

For example, an image uploaded to Cloudinary can be retrieved with a dynamic URL that transforms the original image into a cropped circular image, with a fixed width and height. The final URL becomes:

https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_crop,r_max/w_200/lady.jpg

Several transformation parameters can be included in the URL to modify the image on the fly. You can find more about [Cloudinary here](http://bit.ly/2GbkeT3).

Using the Gatsby-Cloudinary plugins, optimized media assets from Cloudinary are bundled with the static files built by Gatsby. Those optimized assets can either be—

- Sourced directly from Cloudinary with the source plugin.
- Uploaded from local storage to Cloudinary with the transformer plugin. The returned images are transformed into file nodes that are compatible for use with the robust `gatsby-image` component.

## gatsby-source-cloudinary Plugin

[gatsby-source-cloudinary](/packages/gatsby-source-cloudinary/) is a plugin that fetches media assets from Cloudinary. You must first specify the folder from which to query those assets. The plugin then transforms them into Cloudinary file nodes, which can be queried with GraphQL in a Gatsby project.

Before file nodes are created, Cloudinary optimizes media files queried from its platform by applying the `f_auto` and `q_auto` transformation parameters. Impressively, those parameters optimize delivery format and quality for media assets by over 70 percent.

## gatsby-transformer-cloudinary Plugin

[`gatsby-image`](/docs/using-gatsby-image/) is a React component that delivers optimized images in Gatsby apps through GraphQL queries. The gatsby-transformer-cloudinary plugin uploads local files to Cloudinary, which then creates `CloudinaryAsset` nodes that are compatible for use in `gatsby-image`. This plugin can also apply Cloudinary media transformations in the GraphQL queries for the queried media assets.

## Preliminary Steps

The plugins can be used for various JAMstack applications built with Gatsby. The core goal is to store, optimize and deliver media assets with possible transformations. To get started on using the two Gatsby-Cloudinary plugins, follow these steps:

1. [Create a free account on Cloudinary](http://bit.ly/2v3sy4N).
2. [Create a Gatsby project](/tutorial/) with any of the Gatsby starters.
3. Configure either of the plugins in the `gatsby-config.js` file.
4. Refer to the [source plugin](http://bit.ly/2NHVshC) or [transformer plugin](http://bit.ly/2sMqe1u) documentation for the procedure on how to query Cloudinary images or upload and transform them with `gatsby-image`, respectively.

## Next in the Horizon

Given the ever-growing demand for speedy and usable apps and the continual feature advancements of Cloudinary and Gatsby, maintenance and capability enhancements of the plugins are ongoing.

Fork, clone, download, and try out the two plugins yourself. If you run into problems, create an issue in the relevant repository or send us pull requests (PRs) and be sure to check out my [blog on Cloudinary](https://cloudinary.com/blog/introducing_cloudinary_s_gatsby_plugins).
