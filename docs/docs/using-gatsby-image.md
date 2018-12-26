# Using gatsby-image to prevent image bloat

`gatsby-image` is a React component designed to work seamlessly with Gatsby’s GraphQL queries ([`gatsby-image` plugin READme](/packages/gatsby-image/)). It combines [Gatsby’s native image processing](https://image-processing.gatsbyjs.org/) capabilities with advanced image loading techniques to easily and completely optimize image loading for your sites. `gatsby-image` uses [gatsby-plugin-sharp](/packages/gatsby-plugin-sharp/) to power its image transformations.

_Warning: gatsby-image is **not** a drop-in replacement for `<img />`. It’s optimized for fixed width/height images and images that stretch the full-width of a container. Some ways you can use `<img />` won’t work with gatsby-image._

[Demo](https://using-gatsby-image.gatsbyjs.org/)

`gatsby-image` includes the tricks you’d expect from a modern image component. It:

- uses the new [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to cheaply lazy load images
- holds an image’s position so your page doesn’t jump around as images load
- makes it easy to add a placeholder—either a gray background or a blurry version of the image.

## Problem

Large, unoptimized images dramatically slow down your site.

But creating optimized images for websites has long been a thorny problem. Ideally you would:

- Resize large images to the size needed by your design
- Generate multiple smaller images so smartphones and tablets don’t download desktop-sized images
- Strip all unnecessary metadata and optimize JPEG and PNG compression
- Efficiently lazy load images to speed initial page load and save bandwidth
- Use the “blur-up” technique or a ”traced placeholder” SVG to show a preview of the image while it loads
- Hold the image position so your page doesn’t jump while images load

Doing this consistently across a site feels like sisyphean labor. You manually optimize your images and then… several images are swapped in at the last minute or a design-tweak shaves 100px of width off your images.

Most solutions involve a lot of manual labor and bookkeeping to ensure every image is optimized.

This isn’t ideal. Optimized images should be easy and the default.

## Solution

With Gatsby, we can make images way way better.

`gatsby-image` is designed to work seamlessly with Gatsby’s native image processing capabilities powered by GraphQL and Sharp. To produce perfect images, you only need to:

1. Import gatsby-image and use it in place of the built-in img
1. Write a GraphQL query using one of the included GraphQL “fragments” which specify the fields needed by `gatsby-image`.

The GraphQL query creates multiple thumbnails with optimized JPEG and PNG compression. The `gatsby-image` component automatically sets up the “blur-up” effect as well as lazy loading of images further down the screen.

Here’s what a really simple Gatsby page component using gatsby-image would look like:

```jsx
import React from "react"
import Img from "gatsby-image"

export default ({ data }) => (
  <div>
    <h1>Hello gatsby-image</h1>
    <Img resolutions={data.file.childImageSharp.resolutions} />
  </div>
)
```

So this is all very nice and it’s far better to be able to use this from NPM vs. implementing it yourself or cobbling together several standalone libraries.

### References:

- [Plugin READme file](/packages/gatsby-image/)
- [Source code for an example site using gatsby-image](https://github.com/gatsbyjs/gatsby/tree/master/examples/using-gatsby-image)
- [Blog articles about gatsby-image](/blog/tags/gatsby-image/)
- [Starters that use gatsby-image](/starter-showcase/?d=gatsby-image)
- [Other image plugins](/plugins/?=image)
- ["Ridiculously easy image optimization with gatsby-image" by Kyle Gill](https://medium.com/@kyle.robert.gill/ridiculously-easy-image-optimization-with-gatsby-js-59d48e15db6e)
