---
title: Adding Gatsby Image support to your plugin
---

The [new Gatsby image plugin](https://www.gatsbyjs.com/docs/how-to/images-and-media/using-gatsby-plugin-image) includes React components for displaying images. It handles all of the hard parts of displaying responsive images that follow best practices for performance. In fact we are confident that it is the fastest way to render images in React, as it can handle blur-up and lazy-loading before React hydration.
Support for these are available out of the box in `gatsby-transformer-sharp`, so if your plugin downloads images and processes them locally then your users can use the [`gatsbyImageData` resolver](https://www.gatsbyjs.com/docs/how-to/images-and-media/using-gatsby-plugin-image#dynamic-images). However, if your CDN can deliver images of multiple sizes, then the plugin includes a toolkit to allow you to give your users the same great experience without needing to download the images locally. It also allows you to create components that display these images dynamically at runtime, without needing to add a GraphQL resolver.

## Adding a `gatsbyImageData` GraphQL resolver

You can give your users the best experience by adding a `gatsbyImageData` resolver to your image nodes. This allows you to generate low-resolution or traced SVG images as inline data URIs, so your users can have blurred placeholders. You can also calculate the image's dominant color for an alternative placeholder. These are the same placeholders that are included with `gatsby-transformer-sharp`, and will give the best experience for your users. If you are able to deliver these directly from your CMS or other data source then this is ideal, but otherwise you can use helper functions included in `gatsby-plugin-sharp`.

There are three steps to add a basic `gatsbyImageData` resolver:

1. Create a `generateImageSource` function
2. Create a resolver function
3. Add the resolver

### Create the `generateImageSource` function

The `generateImageSource` function is where you define your image URLs. It is passed the base URL, width, height and format (i.e. the image filetytpe), as well as any custom options. You then return the generated URL. The returned object also includes width, height and format. This means you can return a different value from the one requested. For example, if the function requests an unsupported format or size, you can return a different one which will be used instead.

```js:title=gatsby-source-example/gatsby-node.js
// In this example we use a custom `quality` option
const generateImageSource = (baseURL, width, height, format, fit, options) => {
  const src = `https://myexampleimagehost.com/${baseURL}?w=${width}&h=${height}&fmt=${format}&q=${options.quality}`
  return { src, width, height, format }
}
```

### Create the resolver function

You then can use the function created in the previous step to build your resolver function. It can be an async function, and it should return the value from `generateImageData`. An example resolver could look like this:

```js::title=gatsby-source-example/gatsby-node.js

import { generateImageData } from "gatsby-plugin-image"


const resolveGatsbyImageData = async (image, options) => {
   // The `image` argument is the node to which you are attaching the resolver,
   // so the values will depend on your data type.
  const filename = image.src

  const sourceMetadata = {
    width: image.width,
    height: image.height,
    format: image.mimeType.split("/")[1] // gets a value like "jpeg" from "image/jpeg"
  }

  // Generating placeholders is optional, but recommended
  let placeholderURL

  if(options.placeholder === "blurred") {
    // This would be your own function to generate a low-resolution placeholder
    placeholderURL: await getBase64Image({ filename })
  }

  // You could also calculate dominant color, and pass that as `backgroundColor`
  // gatsby-plugin-sharp includes helpers that you can use to generate a tracedSVG or calculate
  // the dominant color of a local file, if you don't want to handle it in your plugin


  return generateImageData({
    ...options,
    // Passing the plugin name allows for better error messages
    pluginName: `gatsby-source-example`,
    sourceMetadata,
    filename,
    placeholderURL
    generateImageSource,
    options,
  })
}

```

### Add the resolver

`gatsby-plugin-image/graphql-utils` includes a utility function to help register the resolver inside the Gatsby [`createResolvers` API hook](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#createResolvers). It registers the resolver with all of the base arguments needed to create the image data, such as width, aspect ratio, layout and background color. These are defined with comprehensive descriptions that are visible when your users are building queries in GraphiQL. You can pass additional arguments supported by your plugin, for example image options such as quality.

The arguments:

- `resolverFunction`: the resolver function that you created before. It receives the node and the arguments and should return the image data object.
- `additionalArgs`: an object defining additional args, in the same format used by [Gatsby Type Builders](https://www.gatsbyjs.com/docs/reference/graphql-data-layer/schema-customization/#gatsby-type-builders)

For example, to add a `gatsbyImageData` resolver onto a `ProductImage` node that you have previously defined:

```js:title=gatsby-source-example/gatsby-node.js
// Note the different import
import { getGatsbyImageResolver } from "gatsby-plugin-image/graphql-utils"

export function createResolvers({ createResolvers }) {
  createResolvers({
    ProductImage: {
      // loadImageData is your custom resolver, defined elsewhere
      gatsbyImageData: getGatsbyImageResolver(loadImageData, {
        quality: "Int",
      }),
    },
  })
}
```

## Adding a custom image component

If you have a URL-based image API, you can create a custom image component that wraps `<GatsbyImage />` and displays images generated at runtime. If you have a source plugin, this could accept your native image object, but it could equally just take a base URL and generate the image based on that. This is a good solution for pure image hosts that aren't handling their own CMS data.

There are two steps to create a custom image component:

1. Create your URL builder function
2. Create your image data function
3. Create your wrapper component

### Create your URL builder function

This is similar to the `generateImageSource` described above, but just returns a URL string. This is an example for the same image host:

```js
function urlBuilder({ baseUrl, width, height, format, options }) {
  return `https://myexampleimagehost.com/${baseURL}?w=${width}&h=${height}&fmt=${format}&q=${options.quality}`
}
```

If your host supports it, we recommend using auto-format to deliver next-generation image formats to supported browsers. In this case, ignore the `format` option.

### Create your image data function

This is a similar to the image resolver described above. However because it executes in the browser, the functions that you use should be fast, and synchronous, and you can't use node APIs. You will not be downloading and generating base64 placeholders, for example, or calculating dominant colors. If you have these values pre-calculated then you can pass these in and use them, but they need to be available in the props that you pass to the function at runtime.

The function should accept the props that will be passed into your component, and at a minimum needs to take the props required by the `getImageData` helper function from `gatsby-plugin-image`. Here is an example for an image host:

```js
import { getImageData } from "gatsby-plugin-image"

export function getExampleImageData(props) {
  return getImageData({
    urlBuilder,
    pluginName: "gatsby-source-example",
    // If your host supports auto-format, pass this as the formats
    formats: ["auto"],
    ...props,
  })
}
```

### Create your wrapper component

This stage is optional: you may prefer to just share the image data function and let your users pass the result to `<GatsbyImage>` themselves. However the developer experience is better with a custom image component.

The component should accept the same props as your image data function, and also all of the props for `<GatsbyImage>` too, which it can pass down to that component. Here's how you might type the props in TypeScript:

```typescript
interface ImageComponentProps
  //This is the type for your image data function
  extends GetGatsbyImageDataProps,
    // We omit "image" because that's the prop that we generate,
    Omit<GatsbyImageProps, "image"> {
  // Any other props can go here
  myCustomProp?: string
}
```

<!-- export interface IGetImageDataArgs<OptionsType = {}> {
  baseUrl: string
  /**
   * For constrained and fixed images, the size of the image element
   */
  width?: number
  height?: number
  /**
   * If available, pass the source image width and height
   */
  sourceWidth?: number
  sourceHeight?: number
  /**
   * If only one dimension is passed, then this will be used to calculate the other.
   */
  aspectRatio?: number
  layout?: Layout
  /**
   * Returns a URL based on the passed arguments. Should be a pure function
   */
  urlBuilder: (args: IUrlBuilderArgs<OptionsType>) => string

  /**
   * Should be a data URI
   */
  placeholderURL?: string
  backgroundColor?: string
  /**
   * Used in error messages etc
   */
  pluginName?: string

  /**
   * If you do not support auto-format, pass an array of image types here
   */
  formats?: Array<ImageFormat>

  breakpoints?: Array<number>

  /**
   * Passed to the urlBuilder function
   */
  options?: OptionsType
} -->
