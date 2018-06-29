# gatsby-image

Speedy, optimized images without the work.

`gatsby-image` is a React component specially designed to work seamlessly with
Gatsby's GraphQL queries. It combines
[Gatsby's native image processing](https://image-processing.gatsbyjs.org/)
capabilities with advanced image loading techniques to easily and completely
optimize image loading for your sites. `gatsby-image` uses
[gatsby-plugin-sharp](/packages/gatsby-plugin-sharp/)
to power its image transformations.

_Warning: gatsby-image is **not** a drop-in replacement for `<img/>`. It's
optimized for fixed width/height images and images that stretch the full-width
of a container. Some ways you can use `<img/>` won't work with gatsby-image._

**[Demo](https://using-gatsby-image.gatsbyjs.org)**

## Problem

Large, unoptimized images dramatically slow down your site.

But creating optimized images for websites has long been a thorny problem.
Ideally you would:

- Resize large images to the size needed by your design
- Generate multiple smaller images so smartphones and tablets don't download
  desktop-sized images
- Strip all unnecessary metadata and optimize JPEG and PNG compression
- Efficiently lazy load images to speed initial page load and save bandwidth
- Use the "blur-up" technique or a
  "[traced placeholder](https://github.com/gatsbyjs/gatsby/issues/2435)" SVG to
  show a preview of the image while it loads
- Hold the image position so your page doesn't jump while images load

Doing this consistently across a site feels like sisyphean labor. You manually
optimize your images and then… several images are swapped in at the last minute
or a design-tweak shaves 100px of width off your images.

Most solutions involve a lot of manual labor and bookkeeping to ensure every
image is optimized.

This isn't ideal. Optimized images should be easy and the default.

## Solution

With Gatsby, we can make images way _way_ better.

`gatsby-image` is designed to work seamlessly with Gatsby's native image
processing capabilities powered by GraphQL and Sharp. To produce perfect images,
you need only:

1.  Import `gatsby-image` and use it in place of the built-in `img`
2.  Write a GraphQL query using one of the included GraphQL "fragments"
    which specify the fields needed by `gatsby-image`.

The GraphQL query creates multiple thumbnails with optimized JPEG and PNG
compression. The `gatsby-image` component automatically sets up the "blur-up"
effect as well as lazy loading of images further down the screen.

## Install

`npm install --save gatsby-image`

Depending on the gatsby starter you used, you may need to include [gatsby-transformer-sharp](/packages/gatsby-transformer-sharp/) and [gatsby-plugin-sharp](/packages/gatsby-plugin-sharp/) as well, and make sure they are installed and included in your gatsby-config.

```
npm install --save gatsby-transformer-sharp
npm install --save gatsby-plugin-sharp
```

Then in your `gatsby-config.js`:

```
plugins: [
  `gatsby-transformer-sharp`,
  `gatsby-plugin-sharp`
];
```

## How to use

This is what a component using `gatsby-image` looks like:

```jsx
import React from "react";
import Img from "gatsby-image";

export default ({ data }) => (
  <div>
    <h1>Hello gatsby-image</h1>
    <Img resolutions={data.file.childImageSharp.resolutions} />
  </div>
);

export const query = graphql`
  query GatsbyImageSampleQuery {
    file(relativePath: { eq: "blog/avatars/kyle-mathews.jpeg" }) {
      childImageSharp {
        # Specify the image processing specifications right in the query.
        # Makes it trivial to update as your page's design changes.
        resolutions(width: 125, height: 125) {
          ...GatsbyImageSharpResolutions
        }
      }
    }
  }
`;
```

For another explanation of how to get started with gatsby-image, see this blog post by community member Kyle Gill [Image Optimization Made Easy with Gatsby.js](https://medium.com/@kyle.robert.gill/ridiculously-easy-image-optimization-with-gatsby-js-59d48e15db6e)

## Two types of responsive images

There are two types of responsive images supported by gatsby-image.

1.  Images that have a _fixed_ width and height
2.  Images that stretch across a fluid container

In the first scenario, you want to vary the image's size for different screen
_resolutions_ -- in other words, create retina images.

For the second scenario, you want to create multiple _sizes_ of thumbnails for
devices with widths stretching from smartphone to wide desktop monitors.

To decide between the two, ask yourself: "do I know the exact size this image
will be?" If yes, it's the first type. If no and its width and/or height need to
vary depending on the size of the screen, then it's the second type.

In Gatsby's GraphQL implementation, you query for the first type by querying a
child object of an image called `resolutions` — which you can see in the sample
component above. For the second type, you do a similar query but for a child
object called `sizes`.

## Fragments

GraphQL includes a concept called "query fragments". Which, as the name
suggests, are a part of a query that can be used in multiple queries. To ease
building with `gatsby-image`, Gatsby image processing plugins which support
`gatsby-image` ship with fragments which you can easily include in your queries.

Note,
[due to a limitation of GraphiQL](https://github.com/graphql/graphiql/issues/612),
you can not currently use these fragments in the GraphiQL IDE.

Plugins supporting `gatsby-image` currently include
[gatsby-transformer-sharp](/packages/gatsby-transformer-sharp/),
[gatsby-source-contentful](/packages/gatsby-source-contentful/) and [gatsby-source-datocms](https://github.com/datocms/gatsby-source-datocms).

Their fragments are:

### gatsby-transformer-sharp

- `GatsbyImageSharpResolutions`
- `GatsbyImageSharpResolutions_noBase64`
- `GatsbyImageSharpResolutions_tracedSVG`
- `GatsbyImageSharpResolutions_withWebp`
- `GatsbyImageSharpResolutions_withWebp_noBase64`
- `GatsbyImageSharpResolutions_withWebp_tracedSVG`
- `GatsbyImageSharpSizes`
- `GatsbyImageSharpSizes_noBase64`
- `GatsbyImageSharpSizes_tracedSVG`
- `GatsbyImageSharpSizes_withWebp`
- `GatsbyImageSharpSizes_withWebp_noBase64`
- `GatsbyImageSharpSizes_withWebp_tracedSVG`

### gatsby-source-contentful

- `GatsbyContentfulResolutions`
- `GatsbyContentfulResolutions_noBase64`
- `GatsbyContentfulResolutions_tracedSVG`
- `GatsbyContentfulResolutions_withWebp`
- `GatsbyContentfulResolutions_withWebp_noBase64`
- `GatsbyContentfulSizes`
- `GatsbyContentfulSizes_noBase64`
- `GatsbyContentfulSizes_tracedSVG`
- `GatsbyContentfulSizes_withWebp`
- `GatsbyContentfulSizes_withWebp_noBase64`

### gatsby-source-datocms

- `GatsbyDatoCmsResolutions`
- `GatsbyDatoCmsResolutions_noBase64`
- `GatsbyDatoCmsSizes`
- `GatsbyDatoCmsSizes_noBase64`

If you don't want to use the blur-up effect, choose the fragment with `noBase64`
at the end. If you want to use the traced placeholder SVGs, choose the fragment
with `tracedSVG` at the end.

If you want to automatically use WebP images when the browser supports the file
format, use the `withWebp` fragments. If the browser doesn't support WebP,
`gatsby-image` will fall back to the default image format.

_Please see the
[gatsby-plugin-sharp](/packages/gatsby-plugin-sharp/#tracedsvg)
documentation for more information on `tracedSVG` and its configuration
options._

## "Resolutions" queries

### Component

Pass in the data returned from the `resolutions` object in your query via the
`resolutions` prop. e.g. `<Img resolutions={resolutions} />`

### Query

```graphql
{
  imageSharp {
    # Other options include height (set both width and height to crop),
    # grayscale, duotone, rotate, etc.
    resolutions(width: 400) {
      # Choose either the fragment including a small base64ed image, a traced placeholder SVG, or one without.
      ...GatsbyImageSharpResolutions
    }
  }
}
```

## "Sizes" queries

### Component

Pass in the data returned from the `sizes` object in your query via the `sizes`
prop. e.g. `<Img sizes={sizes} />`

### Query

```graphql
{
  imageSharp {
    # i.e. the max width of your container is 700 pixels.
    #
    # Other options include maxHeight (set both maxWidth and maxHeight to crop),
    # grayscale, duotone, rotate, etc.
    sizes(maxWidth: 700) {
      # Choose either the fragment including a small base64ed image, a traced placeholder SVG, or one without.
      ...GatsbyImageSharpSizes_noBase64
    }
  }
}
```

## `gatsby-image` props

| Name                    | Type                | Description                                                                                                                 |
| ----------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `resolutions`           | `object`            | Data returned from the `resolutions` query                                                                                  |
| `sizes`                 | `object`            | Data returned from the `sizes` query                                                                                        |
| `fadeIn`                | `bool`              | Defaults to fading in the image on load                                                                                     |
| `title`                 | `string`            | Passed to the `img` element                                                                                                 |
| `alt`                   | `string`            | Passed to the `img` element                                                                                                 |
| `className`             | `string` / `object` | Passed to the wrapper element. Object is needed to support Glamor's css prop                                                |
| `outerWrapperClassName` | `string` / `object` | Passed to the outer wrapper element. Object is needed to support Glamor's css prop                                          |
| `style`                 | `object`            | Spread into the default styles in the wrapper element                                                                       |
| `imgStyle`              | `object`            | Spread into the default styles for the actual `img` element                                                                 |
| `position`              | `string`            | Defaults to `relative`. Pass in `absolute` to make the component `absolute` positioned                                      |
| `backgroundColor`       | `string` / `bool`       | Set a colored background placeholder. If true, uses "lightgray" for the color. You can also pass in any valid color string. |
| `onLoad`                | `func`              | A callback that is called when the full-size image has loaded.                                                              |
| `Tag`                   | `string`            | Which HTML tag to use for wrapping elements. Defaults to `div`.                                                             |

## Image processing arguments

[gatsby-plugin-sharp](/packages/gatsby-plugin-sharp) supports many additional arguments for transforming your images like
`quality`, `sizeByPixelDensity`, `pngCompressionLevel`, `cropFocus`, `greyscale` and many more. See its documentation for more.

## Some other stuff to be aware of

- If you want to set `display: none;` on a component using a `resolutions` prop,
  you need to also pass in to the style prop `{ display: 'inherit' }`.
- Images don't load until JavaScript is loaded. Gatsby's automatic code
  splitting generally makes this fine but if images seem slow coming in on a
  page, check how much JavaScript is being loaded there.
