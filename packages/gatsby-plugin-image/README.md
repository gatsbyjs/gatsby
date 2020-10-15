# Experimental image plugin

This plugin is a replacement for gatsby-image. It adds [static images](#static-images), and a [new higher-performance gatsby-image component](#gatsby-image-next-generation).

This package is in alpha, and the API will change. It is not ready for production use yet.

## Usage

Install `gatsby-plugin-image`, then add it to your `gatsby-config.js`.

# Static images

The [gatsby-image](https://www.gatsbyjs.org/packages/gatsby-image/) component, combined with the sharp plugin, is a great way to automatically resize and optimize your images and serve them in the most performant way. This plugin is a proof of concept for a simpler way to use Gatsby's image processing tools without needing to write GraphQL queries. It is designed for static images such as logos rather than ones loaded dynamically from a CMS.

The current way to do this is with `useStaticQuery`:

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
    base64={false}
    fluid
    webP
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
    return <Img src="trex-png" width={width}>
}
```

You can use variables and expressions if they're in the scope of the file, e.g.:

```js
//OK
() => {
    const width = 300
    return <Img src="trex-png" width={width}>
}
```

```js
//Also OK

const width = 300

() => {
    const height = width * 16 / 9
    return <Img src="trex-png" width={width} height={height}>
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

The only required prop is `src`. The default type is `fixed`.

## gatsby-image next generation

Speedy, optimized images without the work.

gatsby-image is a React component specially designed to give your users a great image experience. It combines speed and best practices. You can use any image processing library that you want. We suggest using gatsby-plugin-sharp as your image processor. Saving images locally improves [the important health metrics](https://web.dev/vitals/) for your site.

Note: gatsby-image is not a drop-in replacement for <img />. It's optimized for fixed width/height images and images that stretch the full-width of a container. You can build your own Gatsby-Image with the utilities we export from this package.

## Table of Contents

- [Problem](#problem)
- [Solution](#solution)
- [Install](#install)
- [How to use](#how-to-use)
- [Types of Responsive Images](#two-types-of-responsive-images)
- [Fixed Queries](#fixed-queries)
- [Fluid Queries](#fluid-queries)
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
// TODO We don't have proper Fragments yet so this isn't user friendly yet
import * as React from "react"
import { graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"

export default ({ data }) => (
  <div>
    <h1>Hello gatsby-image</h1>
    <GatsbyImage
      placeholder={{ fallback: data.file.childImageSharp.fixed.fallback }}
      images={{
        fallback: {
          src: data.file.childImageSharp.fixed.src,
          srcSet: data.file.childImageSharp.fixed.srcSet,
        },
        sources: [
          {
            src: data.file.childImageSharp.fixed.srcWebp,
            srcSet: data.file.childImageSharp.fixed.srcSetWebp,
            type: "image/webp",
          },
        ],
      }}
      width={data.file.childImageSharp.fixed.width}
      height={data.file.childImageSharp.fixed.height}
      layout="fixed"
      alt="my gatsby image"
    />
  </div>
)

export const query = graphql`
  query {
    file(relativePath: { eq: "blog/avatars/kyle-mathews.jpeg" }) {
      childImageSharp {
        # Specify the image processing specifications right in the query.
        # Makes it trivial to update as your page's design changes.
        fixed(width: 125, height: 125) {
          fallback: base64
          width
          height
          src
          srcSet
          srcWebp
          srcSetWebp
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

## Two types of responsive images

There are two types of responsive images supported by gatsby-image.

1. Images that have a _fixed_ width and height
1. Images that stretch across a _fluid_ container

In the first scenario, you want to vary the image's size for different screen
resolutions -- in other words, create retina images.

For the second scenario, you want to create multiple sizes of thumbnails for
devices with widths stretching from smartphone to wide desktop monitors.

To decide between the two, ask yourself: "do I know what the exact size of this image
will be?" If yes, it's the first type. If no and its width and/or height need to
vary depending on the size of the screen, then it's the second type.

In Gatsby's GraphQL implementation, you query for the first type by querying a
child object of an image called `fixed` — which you can see in the sample
component above. For the second type, you do a similar query but for a child
object called `fluid`.

## `gatsby-plugin-image` props

| Name                    | Type            | Description                                                 |
| ----------------------- | --------------- | ----------------------------------------------------------- |
| placeholder             | object          | Object holding the placeholder image                        |
| placeholder.fallback    | string          | Source for the image                                        |
| images                  | array           | List of different image sources (WebP, ...)                 |
| images.fallback         | object          |                                                             |
| images.fallback.src     | string          | The image src if srcset is not supported                    |
| images.fallback.srcSet  | string          |                                                             |
| images.fallback.sizes   | string          |                                                             |
| images.sources          | array           | List of different image sources (WebP, ...)                 |
| images.sources[].srcSet | string          |                                                             |
| images.sources[].sizes  | string          |                                                             |
| images.sources[].type   | string          |                                                             |
| images.sources[].media  | string          |                                                             |
| layout                  | string          | "fixed", "responsive" or "intrinsic" are values for layout. |
| alt                     | string          | Passed to the `img` element. Defaults to an empty string    |
| width                   | number          | Width of the image                                          |
| height                  | number          | Height of the image                                         |
| as                      | React Component | The component that wraps the Gatsby Image.                  |
