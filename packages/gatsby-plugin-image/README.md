# Experimental image plugin

This plugin is a replacement for gatsby-image. It adds [static images](#static-images), and a [new higher-performance gatsby-image component](#gatsby-image-next-generation).
It also adds [a new GraphQL resolver](#graphql-resolver) to gatsby-transformer-sharp

This package is in alpha, and the API will change. It is not ready for production use yet, but feedback would be great.

## Usage

Install `gatsby-plugin-image` and `gatsby-plugin-sharp`, then add them to your `gatsby-config.js`. Upgrade `gatsby` to at least `2.24.78`.

# Static images

This plugin is a proof of concept for a simpler way to use Gatsby's image processing tools and components without needing to write GraphQL queries. It is designed for static images such as logos rather than ones loaded dynamically from a CMS.

The old way to do this is with `useStaticQuery`:

```js
import React from "react"
import Img from "gatsby-image"

export const Dino = () => {
  const data = useStaticQuery(graphql`
    query LogoQuery {
      file(relativePath: { eq: "trex.png" }) {
        childImageSharp {
          fixed(height: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  `)

  return <Img fixed={data?.file?.childImageSharp?.fixed} alt="T-Rex" />
}
```

Using this plugin, the code above can be written as follows:

```js
import React from "react"
import { StaticImage } from "gatsby-plugin-image"

export const Dino = () => (
  <StaticImage height={100} src="trex.png" alt="T-Rex" />
)
```

The `src` prop is relative to the source file, like in static HTML.

You can pass the same options as those available via `ImageSharp` queries:

```js
import React from "react"
import { StaticImage } from "gatsby-plugin-image"

export const Dino = () => (
  <StaticImage
    src="trex.png"
    placeholder="none"
    layout="fluid"
    grayscale
    maxWidth={200}
    alt="T-Rex"
  />
)
```

...is equivalent to:

```js
import React from "react"
import Img from "gatsby-image"

export const Dino = () => {
  const data = useStaticQuery(graphql`
    query LogoQuery {
      file(relativePath: { eq: "trex.png" }) {
        childImageSharp {
          fluid(maxWidth: 200, grayscale: true) {
            ...GatsbyImageSharpFixed_withWebp_noBase64
          }
        }
      }
    }
  `)

  return <Img fixed={data?.file?.childImageSharp?.fixed} alt="T-Rex" />
}
```

## How does it work?

When your site is compiled, any references to StaticImage components are extracted, the images are resized by Sharp in a similar way to `gatsby-transformer-sharp`, and then the resulting sharp object is written to `.cache/caches/gatsby-plugin-image/`, with the filename generated as a hash of the normalized image props. Next, a Babel plugin finds any references to StaticImage, calculates the same hash, then adds a `require()` to that JSON file as a new `__imageData` prop. It then returns a GatsbyImage using that **imageData. Errors don't cause the build to fail, but instead are written to the component as an `**error` prop, which is then logged in develop.

### Are there restrictions to how this is used?

The props must be able to be statically-analyzed at build time. You can't pass them as props from outside the component, or use the results of function calls, for example.

```js
//Doesn't work
({ logo }) => <Img src={logo}>
```

...and nor does this:

```js
//Doesn't work
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

## Installation

```bash
npm install gatsby-plugin-image gatsby-plugin-sharp
```

...then add it to your `gatsby-config.js`:

```js
module.exports = {
  //...
  plugins: [
    "gatsby-plugin-sharp",
    "gatsby-plugin-image",
    //...
  ],
}
```

### API

The only required prop is `src`. The default type is `fixed`. The other props match those of [the new GatsbyImage component](#gatsby-image-next-generation)

## gatsby-image next generation

Speedy, optimized images without the work.

gatsby-image is a React component specially designed to give your users a great image experience. It combines speed and best practices. You can use any image processing library that you want. We suggest using gatsby-plugin-sharp as your image processor. Saving images locally improves [the important health metrics](https://web.dev/vitals/) for your site.

Note: gatsby-image is not a drop-in replacement for <img />. It's optimized for fixed width/height images and images that stretch the full-width of a container. You can build your own Gatsby-Image with the utilities we export from this package.

## Table of Contents

- [Problem](#problem)
- [Solution](#solution)
- [Install](#install)
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

1. Import `{ GatsbyImage } from "gatsby-plugin-image"` and use it in place of the built-in `img`.
2. Write a GraphQL query with all necessary fields needed by `gatsby-plugin-image`.

The GraphQL query creates multiple thumbnails with optimized JPEG and PNG
compression. The `gatsby-plugin-image` component automatically sets up the "blur-up"
effect as well as lazy loading of images further down the screen.

## Install

`npm install gatsby-plugin-image`

Depending on the gatsby starter you used, you may need to include [gatsby-transformer-sharp](/packages/gatsby-transformer-sharp/) and [gatsby-plugin-sharp](/packages/gatsby-plugin-sharp/) as well, and make sure they are installed and included in your gatsby-config.

```shell
npm install gatsby-transformer-sharp gatsby-plugin-sharp
```

Then in your `gatsby-config.js`:

```js
plugins: [
  `gatsby-transformer-sharp`,
  `gatsby-plugin-sharp`,
  `gatsby-plugin-image`,
]
```

Also, make sure you have set up a source plugin, so your images are available in GraphQL queries. For example, if your images live in a project folder on the local filesystem, you would set up `gatsby-source-filesystem` in `gatsby-config.js` like so:

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
  // const imageData = data.file.childImageSharp.gatsbyImage.imageData
  const imageData = getImage(data.file)

  return (
    <div>
      <h1>Hello gatsby-image</h1>
      <GatsbyImage image={imageData} alt="my gatsby image" />
    </div>
  )
}

export const query = graphql`
  query {
    file(relativePath: { eq: "blog/avatars/kyle-mathews.jpeg" }) {
      childImageSharp {
        # Specify the image processing specifications right in the query.
        # Makes it trivial to update as your page's design changes.
        gatsbyImage(layout: FIXED, width: 125, height: 125) {
          imageData
        }
      }
    }
  }
`
```

### Upgrading from the gatsby-image@2

You can use the compat layer to make the transformation easier.

```jsx
import React from "react"
import { graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image/compat"

export default ({ data }) => (
  <div>
    <h1>Hello gatsby-image</h1>
    <GatsbyImage fixed={data.file.childImageSharp.fixed} />
  </div>
)

export const query = graphql`
  query {
    file(relativePath: { eq: "blog/avatars/kyle-mathews.jpeg" }) {
      childImageSharp {
        # Specify the image processing specifications right in the query.
        # Makes it trivial to update as your page's design changes.
        fixed(width: 125, height: 125) {
          ...GatsbyImageSharpFixed
        }
      }
    }
  }
`
```

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

We have added a new resolver to the `ImageSharp` node, with a single field `imageData`. Unlike the existing `fixed` and `fluid` resolvers, this returns a
JSON type, meaning you don't specify the individual fields, but are instead given the whole object. This is because the object is then passed in to the `<GatsbyImage>` component. The API is like this:

```graphql
coverImage: file(relativePath: { eq: "plant.jpg" }) {
  childImageSharp {
    gatsbyImage(maxWidth: 720, layout: FLUID, placeholder: TRACED_SVG) {
      imageData
    }
  }
}
```

```jsx
import { GatsbyImage, getImage } from "gatsby-plugin-image"

export function Plant({ data }) {
  const imageData = getImage(data.coverImage)
  return <GatsbyImage image={imageData} />
}
```

The helper function `getImage` takes a file node and returns `file?.childImageSharp?.gatsbyImage?.imageData`

Because this no longer uses fragments to specify which fields to return, it instead uses arguments passed to the resolver. These include:

- `placeholder`: Format of generated placeholder image.
  DOMINANT*COLOR: a solid color, calculated from the dominant color of the image. (default) \_Currently disabled until sharp is updated*
  BLURRED: a blurred, low resolution image, encoded as a base64 data URI
  TRACED_SVG: a low-resolution traced SVG of the image.
  NONE: no placeholder. Set "background" to use a fixed background color.
- `layout`: The layout for the image.
  FIXED: A static image sized, that does not resize according to the screen width
  FLUID: The image resizes to fit its container. Pass a "sizes" option if it isn't going to be the full width of the screen.
  CONSTRAINED: Resizes to fit its container, up to a maximum width, at which point it will remain fixed in size.
- `outputPixelDensities`: A list of image pixel densities to generate, for high-resolution (retina) screens. It will never generate images larger than the source, and will always a 1x image.
  Default is [ 0.25, 0.5, 1, 2 ], for fluid/constrained images, and [ 1, 2 ] for fixed. In this case, an image with a fluid layout and maxWidth = 400 would generate images at 100, 200, 400 and 800px wide

- `sizes`: The "sizes" property, passed to the img tag. This describes the display size of the image.
  This does not affect the generated images, but is used by the browser to decide which images to download. You can leave this blank for fixed images, or if the responsive image
  container will be the full width of the screen. In these cases we will generate an appropriate value.
