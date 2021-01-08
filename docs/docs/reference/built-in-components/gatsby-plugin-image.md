---
title: Gatsby Image plugin
---

This guide will show you how to configure your images, including choosing layouts, placeholders and image processing options. If you would like to learn how to set up the image plugins and use images on your site, see [the how-to guide](/docs/how-to/images-and-media/using-gatsby-plugin-image).

## Components

The Gatsby Image plugin includes two components to display responsive images on your site, used for static and dynamic images.

- **`StaticImage`:** Use this if the image is the same every time the component is used. _Examples: site logo, index page hero image_
- **`GatsbyImage`:** Use this if the image is passed-in to the component as a prop. _Examples: Blog post hero image, author avatar_

## Image options

The API for both components is almost the same. The difference is how you pass the properties. When using `StaticImage`, they are passed as props to the component, whereas for the `GatsbyImage` component they are passed to the `gatsbyImageData` GraphQL resolver. There is a small change in the values too: in the `StaticImage` component, props such as layout and placeholder take a string, while the resolver takes a GraphQL enum, which is in upper case by convention and is not quoted like a string. Both options are shown in the reference below.

> It is a very good idea to use [the GraphiQL IDE](/docs/how-to/querying-data/running-queries-with-graphiql) when writing your `gatsbyImageData` queries. It includes auto-complete and inline documentation for all of the options and lets you see the generated image data right inside the IDE.

### Layout

**Prop name: `layout`**

The image components support three types of layout, which determine the image sizes that are generated, as well as the resizing behavior of the image itself in the browser. You can compare the layouts in the video below:

<video controls autoplay loop>
  <source type="video/mp4" src="./layouts.mp4" />
  <p>Your browser does not support the video element.</p>
</video>

To set the layout, pass in the type to the layout prop. e.g.

```jsx
<StaticImage
  src="./dino.png"
  alt="A dinosaur"
  // highlight-next-line
  layout="fixed"
/>
```

Alternatively, pass it to the resolver:

```graphql
dino {
  childImageSharp {
    # highlight-next-line
    gatsbyImageData(layout: FIXED)
  }
}
```

#### Constrained

_Component prop: `"constrained"`. Resolver prop: `CONSTRAINED`_

This is the default layout. It displays the image at same size as the source image, or you can set a maximum size by passing in `width` or `height`). If the screen or container size is less than the width of the image, it scales down to fit, maintaining its aspect ratio. It generates smaller versions of the image so that a mobile browser doesn't need to load the full-size image.

#### Fixed

_Component prop: `"fixed"`. Resolver prop: `FIXED`_

This is a fixed-size image. It will always display at the same size, and will not shrink to fit its container. This is either the size of the source image, or the size set by the `width` and `height` props. Only use this if you are certain that the container will never need to be narrower than the image.

#### Full Width

_Component prop: `"fullWidth"`. Resolver prop: `FULL_WIDTH`_

Use this for images that are always displayed at the full width of the screen, such as banners or hero images. Like the constrained layout, this resizes to fit the container. However it is not restricted to a maximum size, so will grow to fill it however large it is, maintaining its aspect ratio. It generates several smaller image sizes for different screen breakpoints, so that the browser only needs to load one large enough to fit the screen. You can pass a `breakpoints` prop if you want to specify the sizes to use, though in most cases you can allow it to use the default.

### Size

Size props are optional in `GatsbyImage` and `StaticImage`. Because the images are processed at build time, the plugin knows the size of the source image and can add the correct width and height to the `<img>` tag, so it displays correctly with no layout jumping. However, if you want to change the display size you can use the size options to do this.

#### `width`/`height`

_Layouts: fixed and constrained_

For a `fixed` layout, these define the size of the image displayed on screen. For a `constrained` image these define the maximum size, as the image will scale down to fit smaller containers if needed.

If you set just one of these, the source image is resized to that width or height while maintaining aspect ratio. If you include both then it is also cropped if needed to ensure it is that exact size.

#### `aspectRatio`

_Layouts: fixed, constrained, and fullWidth_

The `aspectRatio` prop forces an image to the specified aspect ratio, cropping if needed.

For `fixed` and `constrained` images, you can also optionally pass either a `width` or `height`, and it will use that to calculate the other dimension. For example, if you pass `width={800} aspectRatio={4/3}` then `height` will be set to the width divided by the aspect ratio: so `600`. Passing `1` as the aspectRatio will crop the image to a square. If you don't pass a width or height then it will use the source image's width.

For `fullWidth` images you don't specify width or height as it resizes to fit the screen width. Passing `aspectRatio` will crop the image if needed, and the height will scale according to the width of the screen. For example, if you set the aspectRatio to `16/9` then when the image is displayed full width on a screen that is 1024px wide, the image will be 576 pixels high.

> There are several advanced options that you can pass to control the cropping and resizing behavior. For more details, see the advanced options reference.

### Placeholder

**Prop name: `placeholder`**

Gatsby image components are lazy-loaded by default, which means that if they are offscreen they are not loaded by the browser until the come into view. To ensure that the layout does not jump around, a placeholder is displayed before the image loads. There are three types of placeholder that you can choose:

#### Dominant color

_Component prop: `"dominantColor"`. Resolver prop: `DOMINANT_COLOR`_

The calculates the dominant color in the source image, and uses this as a solid background color.

#### Blurred

_Component prop: `"blurred"`. Resolver prop: `BLURRED`_

This generates a very low-resolution version of the source image and displays it as a blurred background.

#### Traced SVG

_Component prop: `"tracedSVG"`. Resolver prop: `TRACED_SVG`_

This generates a simplified, flat SVG version of the source image, which it displays as a placeholder. This works well for images with simple shapes or that include transparency.

### Output formats

**Prop name: `formats`**

The Gatsby Image plugin supports four output formats: JPEG, PNG, WebP and AVIF. By default, the plugin generates images in the same format as the source image, as well as WebP. For example, if your source image is a PNG, it will generate PNG and WebP images. In most cases, you should not change this. However, in some cases, you may need to manually set the formats. One reason for doing so is if you want to enable support for AVIF images. AVIF is a new image format that results in significantly smaller file sizes than alternative formats. It currently has [limited browser support](https://caniuse.com/avif), but this is likely to expand, and it is safe to include as long as you also generate fallbacks for other browsers, which the image plugin does automatically.

_Default component prop value: `["auto", "webp"]`. Default resolver prop value: `[AUTO, WEBP]`_

## Advanced settings

The Gatsby Image plugin uses [sharp](https://sharp.pixelplumbing.org) for image processing, and supports passing through many advanced options, such as those affecting cropping behavior or image effects including grayscale or duotone. For full details see the advanced options reference.
