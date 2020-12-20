# gatsby-plugin-image (beta)

This plugin is a replacement for gatsby-image. It adds [static images](#staticimage), and a [new higher-performance gatsby-image component](#gatsbyimage). It also adds [a new GraphQL resolver](#graphql-resolver) to gatsby-transformer-sharp.

## Contents

- [StaticImage](#staticimage) - the new static image component
- [GatsbyImage](#gatsbyimage) - a high-performance gatsby-image component
- [gatsbyImageData](#graphql-resolver) - a simpler GraphQL API

## Usage

1. Install `gatsby-plugin-image` and `gatsby-plugin-sharp`:

```shell
npm install gatsby-plugin-image gatsby-plugin-sharp
```

If you're using the new `GatsbyImage` in addition to `StaticImage`, you'll also want to install `gatsby-transformer-sharp`.

2. Upgrade `gatsby` to at least `2.24.78`.

3. Add the plugins to your `gatsby-config.js`:

```javascript
module.exports = {
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    // `gatsby-transformer-sharp`
  ],
}
```

# StaticImage

This component is a new, simpler way to use Gatsby's image processing tools and components without needing to write GraphQL queries. It is designed for static images such as logos rather than ones loaded dynamically from a CMS.

```js
import React from "react"
import { StaticImage } from "gatsby-plugin-image"

export const Dino = () => (
  <StaticImage height={100} src="trex.png" alt="T-Rex" />
)
```

The `src` prop is relative to the source file, like in static HTML.

You can pass the same options as those available via [`gatsbyImageData`](#graphql-resolver) queries:

```js
import React from "react"
import { StaticImage } from "gatsby-plugin-image"

export const Dino = () => (
  <StaticImage
    src="trex.png"
    placeholder="none"
    layout="fluid"
    maxWidth={200}
    alt="T-Rex"
    transformOptions={{ grayscale: true }}
  />
)
```

### Are there restrictions to how this is used?

Because the images still need to be resized during build, the props must be able to be statically-analyzed at build time. You can't pass them as props from outside the component, or use the results of function calls, for example.

This does not work:

```js
// ⚠️ Doesn't work

({ logo }) => <Img src={logo}>
```

...and nor does this:

```js
// ⚠️ Doesn't work

() => {
    const width = getTheWidthFromSomewhere();
    return <Img src="trex.png" width={width}>
}
```

You can use variables and expressions if they're in the scope of the file, e.g.:

```js
//OK
() => {
    const width = 300
    return <Img src="trex.png" width={width}>
}
```

```js
//Also OK

const width = 300

() => {
    const height = width * 16 / 9
    return <Img src="trex.png" width={width} height={height}>
}
```

### API

The only required prop is `src`. The default type is `constrained`. The other props match those of [the new GatsbyImage component](#gatsbyimage). You can also pass in options which are forwarded to [`gatsbyImageData`](#graphql-resolver).

## GatsbyImage

Speedy, optimized images without the work.

GatsbyImage is a React component specially designed to give your users a great image experience. It combines speed and best practices.

Note: GatsbyImage is not a drop-in replacement for `<img>`. It's optimized for fixed width/height images and images that stretch the full-width of a container.

## Table of Contents

- [Problem](#problem)
- [Solution](#solution)
- [How to use](#how-to-use)
- [Types of Responsive Images](#three-types-of-responsive-images)
- [Gatsby Image Props](#gatsby-plugin-image-props)

## Problem

Large, unoptimized images dramatically slow down your site.

But creating optimized images for websites has long been a thorny problem.
Ideally you would:

- Resize large images to the size needed by your design.
- Generate multiple smaller images so smartphones and tablets don't download
  desktop-sized images.
- Strip all unnecessary metadata and optimize JPEG and PNG compression.
- Efficiently lazy load images to speed initial page load and save bandwidth.
- Use the "blur-up" technique or a
  "[traced placeholder](https://github.com/gatsbyjs/gatsby/issues/2435)" SVG to
  show a preview of the image while it loads.
- Hold the image position so your page doesn't jump while images load.

Doing this consistently across a site feels like a task that can never be completed. You manually
optimize your images and then… several images are swapped in at the last minute
or a design-tweak shaves 100px of width off your images.

Most solutions involve a lot of manual labor and bookkeeping to ensure every
image is optimized.

This isn't ideal. Optimized images should be easy and the default.

## Solution

With Gatsby, we can make images way _way_ better.

`gatsby-plugin-image` is designed to work seamlessly with Gatsby's native image
processing capabilities powered by GraphQL and Sharp. To produce perfect images,
you need only:

1. Import `{ GatsbyImage } from "gatsby-plugin-image"`.
2. Write a GraphQL query with all necessary fields needed by `gatsby-plugin-image`.

The GraphQL query creates multiple thumbnails with optimized JPEG and PNG
compression. The `gatsby-plugin-image` component automatically sets up the "blur-up"
effect as well as lazy loading of images further down the screen.

Make sure you have set up a source plugin, so your images are available in GraphQL queries. For example, if your images live in a project folder on the local filesystem, you would set up `gatsby-source-filesystem` in `gatsby-config.js` like so:

```js
const path = require(`path`)

module.exports = {
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: path.join(__dirname, `src`, `images`),
      },
    },
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-image`,
  ],
}
```

## How to use

This is what a component using `gatsby-plugin-image` looks like:

```jsx
import * as React from "react"
import { graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

export default ({ data }) => {
  // You can use the helper function `getImage`, which is equivalent to:
  // const imageData = data.file.childImageSharp.gatsbyImageData
  const imageData = getImage(data.file)

  return (
    <div>
      <h1>Hello GatsbyImage</h1>
      <GatsbyImage image={imageData} alt="my gatsby image" />
    </div>
  )
}

export const query = graphql`
  query {
    file(relativePath: { eq: "blog/avatars/kyle-mathews.jpeg" }) {
      childImageSharp {
        gatsbyImageData(layout: FIXED, width: 125, height: 125)
      }
    }
  }
`
```

If you need the image `src` directly you can import the `getSrc` helper function from `gatsby-plugin-image`. That function is equivalent to `data.file.childImageSharp.gatsbyImageData.images.fallback.src`. Note that `src` will be undefined if a .png or .jpg image is not available.

### Upgrading from the gatsby-image@2

We've included a codemod to help you migrate to the new `gatsby-plugin-image` API.

```shell
npx gatsby-codemods gatsby-plugin-image <path>
```

`path` is not required and will default to the directory you're currently in.

Note that you cannot pass additional flags to this command. It will automatically run the codemod against file extensions `js, jsx, ts, tsx` and ignore the `node_modules`, `.cache` and `public` directories of your project.

**If you have a custom babel config for your site, run in the root directory, otherwise `./src` is sufficient.**

Note that jscodeshift tries to match the formatting of your existing code, but you may need to use a tool like [prettier](https://prettier.io/) to ensure consistency after running these codemods.

If you need to run with custom flags, you can install [jscodeshift](https://github.com/facebook/jscodeshift) globally and `gatsby-codemods` in your project. Then `jscodeshift -t node_modules/gatsby-codemods/transforms/gatsby-plugin-image.js .` will transform your current directory and you can pass any valid jscodeshift flags.

After the code is modified, be sure to install and configure everything needed to use `gatsby-plugin-image.`

1. Install this package

```shell
npm install gatsby-plugin-image
```

2. Add `gatsby-plugin-image` to your `gatsby-config.js` file.

3. Make sure `gatsby-transformer-sharp` and `gatsby-plugin-sharp` are updated to the latest versions.

## Three types of responsive images

There are three types of responsive images supported by gatsby-image.

1. Images that have a _fixed_ width and height
1. Images that stretch across a _fluid_ container
1. Images that stretch across a container but are _constrained_ to a maximum width

In the first scenario, you want to vary the image's size for different screen
resolutions -- in other words, create retina images.

For the second and third scenario, you want to create multiple sizes of thumbnails for
devices with widths stretching from smartphone to wide desktop monitors.

To decide between the two, ask yourself: "do I know what the exact size of this image
will be?" If yes, it's "fixed". If no and its width and/or height need to
vary depending on the size of the screen, then it's "fluid". If you want it to shrink
to fit on smaller screens, but not to expand larger than a maximum, then use "constrained"

In Gatsby's GraphQL implementation, you specify the type of image with the `layout` argument

## `GatsbyImage` props

| Name  | Type            | Description                                                                                                                |
| ----- | --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| image | object          | The image data object returned from a GraphQL query                                                                        |
| alt   | string          | Passed to the `img` element. Defaults to an empty string                                                                   |
| sizes | string          | An HTML "sizes" argument, which is passed-though to the image. Can be left blank, when it will be calculated automatically |
| as    | React Component | The component that wraps the Gatsby Image. Default is `div`                                                                |

# GraphQL resolver

We have added a new `gatsbyImageData` resolver to the `ImageSharp` node. Unlike the existing `fixed` and `fluid` resolvers, this returns a
JSON type, meaning you don't specify the individual fields, but are instead given the whole object. This is because the object is then passed in to the `<GatsbyImage>` component. The API is like this:

```graphql
coverImage: file(relativePath: { eq: "plant.jpg" }) {
  childImageSharp {
    gatsbyImageData(maxWidth: 720, layout: FLUID, placeholder: TRACED_SVG)
  }
}
```

You then use the data like this:

```jsx
import { GatsbyImage, getImage } from "gatsby-plugin-image"

export function Plant({ data }) {
  const imageData = getImage(data.coverImage)
  return <GatsbyImage image={imageData} alt="Plant" />
}
```

The optional helper function `getImage` takes a file node and returns `file?.childImageSharp?.gatsbyImageData`

## API

These arguments can be passed to the `gatsbyImageData()` resolver:

- **width**: The display width of the generated image. The actual largest image resolution will be this value multipled by the largest value in outputPixelDensities. Ignored if layout = FLUID or CONSTRAINED, where you should use "maxWidth" instead.
- **height**: If set, the height of the generated image. If omitted, it is calculated from the supplied width, matching the aspect ratio of the source image.
- **maxWidth**:
  Maximum display width of generated files.
  The actual largest image resolution will be this value multipled by the largest value in outputPixelDensities
  This only applies when layout = FLUID or CONSTRAINED. For other layout types, use "width"
- **maxHeight**: If set, the generated image is a maximum of this height, cropping if necessary. If the image layout is "constrained" then the image will be limited to this height. If the aspect ratio of the image is different than the source, then the image will be cropped.`,
- **placeholder**: Format of generated placeholder image.
  - `BLURRED`: (default) a blurred, low resolution image, encoded as a base64 data URI
  - `TRACED_SVG`: a low-resolution traced SVG of the image.
  - `NONE`: no placeholder. Set "background" to use a fixed background color.
  - `DOMINANT_COLOR`: a solid color, calculated from the dominant color of the image.
- **layout**: The layout for the image.
  - `CONSTRAINED`: (default) Resizes to fit its container, up to a maximum width, at which point it will remain fixed in size.
  - `FIXED`: A static image size, that does not resize according to the screen width
  - `FLUID`: The image resizes to fit its container. Pass a "sizes" option if it isn't going to be the full width of the screen.
- **outputPixelDensities**: A list of image pixel densities to generate, for high-resolution (retina) screens. It will never generate images larger than the source, and will always include a 1x image.
  Default is `[ 0.25, 0.5, 1, 2 ]`, for fluid/constrained images, and `[ 1, 2 ]` for fixed. In this case, an image with a fluid layout and maxWidth = 400 would generate images at 100, 200, 400 and 800px wide
- **sizes**: The "[sizes](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)" attribute, passed to the `<img>` tag. This describes the display size of the image. This does not affect the generated images, but is used by the browser to decide which images to download. You can leave this blank for fixed images, or if the responsive image container will be the full width of the screen. In these cases we will generate an appropriate value. If, however, you are generating responsive images that are not the full width of the screen, you should provide a sizes property for best performance. You can alternatively pass this value to the component.
- **formats**: an array of file formats to generate. The default is `[AUTO, WEBP]`, which means it will generate images in the same format as the source image, as well as in the next-generation [WebP](https://developers.google.com/speed/webp) format. We strongly recommend you do not change this option, as doing so will affect performance scores.
- **quality**: The default quality. This is overriden by any format-specific options
- **blurredOptions**: Options for the low-resolution placeholder image. Set placeholder to "BLURRED" to use this
  - width
  - toFormat
- **tracedSVGOptions**: Options for traced placeholder SVGs. You also should set placeholder to "SVG".
- **jpgOptions**: Options to pass to sharp when generating JPG images.
  - quality
  - progressive
- **pngOptions**: Options to pass to sharp when generating PNG images.
  - quality
  - compressionSpeed
- **webpOptions**: Options to pass to sharp when generating WebP images.
  - quality
- **transformOptions**: Options to pass to sharp to control cropping and other image manipulations.
  - grayscale
  - duotone
  - rotate
  - trim
  - cropFocus
  - fit
- **background**: Background color applied to the wrapper. Also passed to sharp to use as a background when "letterboxing" an image to another aspect ratio.
