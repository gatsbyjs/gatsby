---
title: Working With Images In Gatsby
---

Optimizing images is a challenge on any website. To utilize best practices for performance across devices, you need multiple sizes and resolutions of each image. Luckily, Gatsby has several useful [plugins](/docs/plugins/) that work together to do that for images on [page components](/docs/building-with-components/#page-components).

The recommended approach is to use [GraphQL queries](/docs/querying-with-graphql/) to get images of the optimal size or resolution, then, display them with the [`gatsby-image`](/packages/gatsby-image/) component.

## Query Images With GraphQL

Querying images with GraphQL allows you to access the image's data as well as perform transformations with [Sharp](https://github.com/lovell/sharp), a high-performance image processing library.

You'll need a few plugins for this:

- [`gatsby-source-filesystem`](/packages/gatsby-source-filesystem/) plugin allows you to [query files with GraphQL](/docs/querying-with-graphql/#images)
- [`gatsby-plugin-sharp`](/packages/gatsby-plugin-sharp) powers the connections between Sharp and Gatsby Plugins
- [`gatsby-transformer-sharp`](/packages/gatsby-transformer-sharp/) allows you to create multiples images of the right sizes and resolutions with a query

If the final image is of a fixed size, optimization relies on having multiple resolutions of the image. If it is responsive, that is it stretches to fill a container or page, optimization relies on having different sizes of the same image. See the [Gatsby Image documentation for more information](/packages/gatsby-image/#two-types-of-responsive-images).

You can also use arguments in your query to specify exact, minimum, and maximum dimensions. See the [Gatsby Image documentation for complete options](/packages/gatsby-image/#two-types-of-responsive-images).

This example is for an image gallery where images stretch when the page is resized. It uses the `fluid` method and the fluid fragment to grab the right data to use in `gatsby-image` component and arguments to set the maximum width as 400px and maximum height as 250px.

```js
export const query = graphql`
  query {
    fileName: file(relativePath: { eq: "images/myimage.jpg" }) {
      childImageSharp {
        fluid(maxWidth: 400, maxHeight: 250) {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }
`
```

## Optimizing Images With Gatsby Image

[`gatsby-image`](/packages/gatsby-image/) is a plugin that automatically creates React components for optimized images that:

> - Loads the optimal size of image for each device size and screen resolution
> - Holds the image position while loading so your page doesn't jump around as images load
> - Uses the "blur-up" effect i.e. it loads a tiny version of the image to show while the full image is loading
> - Alternatively provides a "traced placeholder" SVG of the image
> - Lazy loads images, which reduces bandwidth and speeds the initial load time
> - Uses [WebP](https://developers.google.com/speed/webp/) images, if browser supports the format

Here is an image component that uses the query from the previous example:

```jsx
<Img fluid={data.fileName.childImageSharp.fluid} />
```

## Preparing your images to be processed

While gatsby takes care of optimizing your images for each device size and screen resolution you need to note that those operations can have significant impact on your build's duration and resources consumption.

Images that are of several MBs of size or of big dimensions will exponentially increase the load to optimize your images. This is why it is important to prepare and pre-optimize your images.

Taking as an example a website with 150 images all ranging from 1-3MB and with a width of 3000 pixels, gatsby takes about 15 minutes to create fluid images with a maximum width of 1000 pixels. Same amount of pictures takes only minute to be processed when they weight no more than 300kb and are already resized to 1000 pixels of width.

Here's an example script to pre-optimize your pictures:

```js
const sharp = require(`sharp`)
const glob = require(`glob`)
const fs = require(`fs-extra`)

const matches = glob.sync(`src/images/**/*.{png,jpg,jpeg}`)
const MAX_WIDTH = 1000
const QUALITY = 70

Promise.all(
  matches.map(async match => {
    const stream = sharp(match)
    const info = await stream.metadata()

    if (info.width < MAX_WIDTH) {
      return
    }

    const optimizedName = match.replace(
      /(\..+)$/,
      (match, ext) => `-optimized${ext}`
    )

    await stream
      .resize(MAX_WIDTH)
      .jpeg({ quality: QUALITY })
      .toFile(optimizedName)

    return fs.rename(optimizedName, match)
  })
)
```

The default values of maximum width and quality are to be tuned with regards to your website. As a rule of thumb the maximum width set should be the same as in your `gatsby-plugin-sharp` transformations and the quality should normally not be less than 60.

## Using Fragments To Standardize Formatting

What if you have a bunch of images and you want them all to use the same formatting?

A custom fragment is an easy way to standardize formatting and re-use it on multiple images:

```js
export const squareImage = graphql`
  fragment squareImage on File {
    childImageSharp {
      fluid(maxWidth: 200, maxHeight: 200) {
        ...GatsbyImageSharpFluid
      }
    }
  }
`
```

The fragment can then be referenced in the image query:

```js
export const query = graphql`
  query {
    image1: file(relativePath: { eq: "images/image1.jpg" }) {
      ...squareImage
    }

    image2: file(relativePath: { eq: "images/image2.jpg" }) {
      ...squareImage
    }

    image3: file(relativePath: { eq: "images/image3.jpg" }) {
      ...squareImage
    }
  }
`
```
