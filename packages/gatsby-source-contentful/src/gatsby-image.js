// @ts-check
const { stripIndent } = require(`common-tags`)

const {
  ImageFormatType,
  ImageResizingBehavior,
  ImageCropFocusType,
} = require(`./schemes`)

const {
  createUrl,
  isImage,
  getBasicImageProps,
  getBase64Image,
  getTracedSVG,
  CONTENTFUL_IMAGE_MAX_SIZE,
} = require(`./image-helpers`)

const {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLNonNull,
} = require(`gatsby/graphql`)

import { sortBy } from "lodash"

/**
 * This code is related to the deprecated gatsby-image plugin.
 *
 * The file and code will be removed soon.
 */

export const resolveFixed = (image, options) => {
  if (!isImage(image)) return null

  const { baseUrl, width, aspectRatio } = getBasicImageProps(image, options)

  let desiredAspectRatio = aspectRatio

  // If no dimension is given, set a default width
  if (options.width === undefined && options.height === undefined) {
    options.width = 400
  }

  // If only a height is given, calculate the width based on the height and the aspect ratio
  if (options.height !== undefined && options.width === undefined) {
    options.width = Math.round(options.height * desiredAspectRatio)
  }

  // If we're cropping, calculate the specified aspect ratio.
  if (options.width !== undefined && options.height !== undefined) {
    desiredAspectRatio = options.width / options.height
  }

  // If the user selected a height and width (so cropping) and fit option
  // is not set, we'll set our defaults
  if (options.width !== undefined && options.height !== undefined) {
    if (!options.resizingBehavior) {
      options.resizingBehavior = `fill`
    }
  }

  // Create sizes (in width) for the image. If the width of the
  // image is 800px, the sizes would then be: 800, 1200, 1600,
  // 2400.
  //
  // This is enough sizes to provide close to the optimal image size for every
  // device size / screen resolution
  let fixedSizes = []
  fixedSizes.push(options.width)
  fixedSizes.push(options.width * 1.5)
  fixedSizes.push(options.width * 2)
  fixedSizes.push(options.width * 3)
  fixedSizes = fixedSizes.map(Math.round)

  // Filter out sizes larger than the image's width and the contentful image's max size.
  const filteredSizes = fixedSizes.filter(size => {
    const calculatedHeight = Math.round(size / desiredAspectRatio)
    return (
      size <= CONTENTFUL_IMAGE_MAX_SIZE &&
      calculatedHeight <= CONTENTFUL_IMAGE_MAX_SIZE &&
      size <= width
    )
  })

  // Sort sizes for prettiness.
  const sortedSizes = sortBy(filteredSizes)

  // Create the srcSet.
  const srcSet = sortedSizes
    .map((size, i) => {
      let resolution
      switch (i) {
        case 0:
          resolution = `1x`
          break
        case 1:
          resolution = `1.5x`
          break
        case 2:
          resolution = `2x`
          break
        case 3:
          resolution = `3x`
          break
        default:
      }
      const h = Math.round(size / desiredAspectRatio)
      return `${createUrl(baseUrl, {
        ...options,
        width: size,
        height: h,
      })} ${resolution}`
    })
    .join(`,\n`)

  let pickedHeight
  let pickedWidth
  if (options.height) {
    pickedHeight = options.height
    pickedWidth = options.height * desiredAspectRatio
  } else {
    pickedHeight = options.width / desiredAspectRatio
    pickedWidth = options.width
  }

  return {
    aspectRatio: desiredAspectRatio,
    baseUrl,
    width: Math.round(pickedWidth),
    height: Math.round(pickedHeight),
    src: createUrl(baseUrl, {
      ...options,
      width: options.width,
    }),
    srcSet,
  }
}

export const resolveFluid = (image, options) => {
  if (!isImage(image)) return null

  const { baseUrl, width, aspectRatio } = getBasicImageProps(image, options)

  let desiredAspectRatio = aspectRatio

  // If no dimension is given, set a default maxWidth
  if (options.maxWidth === undefined && options.maxHeight === undefined) {
    options.maxWidth = 800
  }

  // If only a maxHeight is given, calculate the maxWidth based on the height and the aspect ratio
  if (options.maxHeight !== undefined && options.maxWidth === undefined) {
    options.maxWidth = Math.round(options.maxHeight * desiredAspectRatio)
  }

  // If we're cropping, calculate the specified aspect ratio.
  if (options.maxHeight !== undefined && options.maxWidth !== undefined) {
    desiredAspectRatio = options.maxWidth / options.maxHeight
  }

  // If the users didn't set a default sizes, we'll make one.
  if (!options.sizes) {
    options.sizes = `(max-width: ${options.maxWidth}px) 100vw, ${options.maxWidth}px`
  }

  // Create sizes (in width) for the image. If the max width of the container
  // for the rendered markdown file is 800px, the sizes would then be: 200,
  // 400, 800, 1200, 1600, 2400.
  //
  // This is enough sizes to provide close to the optimal image size for every
  // device size / screen resolution
  let fluidSizes = []
  fluidSizes.push(options.maxWidth / 4)
  fluidSizes.push(options.maxWidth / 2)
  fluidSizes.push(options.maxWidth)
  fluidSizes.push(options.maxWidth * 1.5)
  fluidSizes.push(options.maxWidth * 2)
  fluidSizes.push(options.maxWidth * 3)
  fluidSizes = fluidSizes.map(Math.round)

  // Filter out sizes larger than the image's maxWidth and the contentful image's max size.
  const filteredSizes = fluidSizes.filter(size => {
    const calculatedHeight = Math.round(size / desiredAspectRatio)
    return (
      size <= CONTENTFUL_IMAGE_MAX_SIZE &&
      calculatedHeight <= CONTENTFUL_IMAGE_MAX_SIZE &&
      size <= width
    )
  })

  // Add the original image (if it isn't already in there) to ensure the largest image possible
  // is available for small images.
  if (
    !filteredSizes.includes(width) &&
    width < CONTENTFUL_IMAGE_MAX_SIZE &&
    Math.round(width / desiredAspectRatio) < CONTENTFUL_IMAGE_MAX_SIZE
  ) {
    filteredSizes.push(width)
  }

  // Sort sizes for prettiness.
  const sortedSizes = sortBy(filteredSizes)

  // Create the srcSet.
  const srcSet = sortedSizes
    .map(width => {
      const h = Math.round(width / desiredAspectRatio)
      return `${createUrl(image.file.url, {
        ...options,
        width,
        height: h,
      })} ${Math.round(width)}w`
    })
    .join(`,\n`)

  return {
    aspectRatio: desiredAspectRatio,
    baseUrl,
    src: createUrl(baseUrl, {
      ...options,
      width: options.maxWidth,
      height: options.maxHeight,
    }),
    srcSet,
    sizes: options.sizes,
  }
}

export const resolveResize = (image, options) => {
  if (!isImage(image)) return null

  const { baseUrl, aspectRatio } = getBasicImageProps(image, options)

  // If no dimension is given, set a default width
  if (options.width === undefined && options.height === undefined) {
    options.width = 400
  }

  // If the user selected a height and width (so cropping) and fit option
  // is not set, we'll set our defaults
  if (options.width !== undefined && options.height !== undefined) {
    if (!options.resizingBehavior) {
      options.resizingBehavior = `fill`
    }
  }

  let pickedHeight = options.height
  let pickedWidth = options.width

  if (pickedWidth === undefined) {
    pickedWidth = pickedHeight * aspectRatio
  }

  if (pickedHeight === undefined) {
    pickedHeight = pickedWidth / aspectRatio
  }

  return {
    src: createUrl(image.file.url, options),
    width: Math.round(pickedWidth),
    height: Math.round(pickedHeight),
    aspectRatio,
    baseUrl,
  }
}

export const fixedNodeType = ({ store, reporter }) => {
  return {
    type: new GraphQLObjectType({
      name: `ContentfulFixed`,
      fields: {
        base64: {
          type: GraphQLString,
          resolve: imageProps => getBase64Image(imageProps, reporter),
        },
        tracedSVG: {
          type: GraphQLString,
          resolve: imageData => getTracedSVG(imageData, { store, reporter }),
        },
        aspectRatio: { type: GraphQLFloat },
        width: { type: new GraphQLNonNull(GraphQLFloat) },
        height: { type: new GraphQLNonNull(GraphQLFloat) },
        src: { type: new GraphQLNonNull(GraphQLString) },
        srcSet: { type: new GraphQLNonNull(GraphQLString) },
        srcWebp: {
          type: GraphQLString,
          resolve({ image, options }) {
            if (
              image?.file?.contentType === `image/webp` ||
              options.toFormat === `webp`
            ) {
              return null
            }

            const fixed = resolveFixed(image, {
              ...options,
              toFormat: `webp`,
            })
            return fixed?.src
          },
        },
        srcSetWebp: {
          type: GraphQLString,
          resolve({ image, options }) {
            if (
              image?.file?.contentType === `image/webp` ||
              options.toFormat === `webp`
            ) {
              return null
            }

            const fixed = resolveFixed(image, {
              ...options,
              toFormat: `webp`,
            })
            return fixed?.srcSet
          },
        },
      },
    }),
    args: {
      width: {
        type: GraphQLInt,
      },
      height: {
        type: GraphQLInt,
      },
      quality: {
        type: GraphQLInt,
        defaultValue: 50,
      },
      toFormat: {
        type: ImageFormatType,
        defaultValue: ``,
      },
      resizingBehavior: {
        type: ImageResizingBehavior,
      },
      cropFocus: {
        type: ImageCropFocusType,
        defaultValue: null,
      },
      cornerRadius: {
        type: GraphQLInt,
        defaultValue: 0,
        description: stripIndent`
         Desired corner radius in pixels. Results in an image with rounded corners.
         Pass \`-1\` for a full circle/ellipse.`,
      },
      background: {
        type: GraphQLString,
        defaultValue: null,
      },
    },
    resolve(image, options, context) {
      const node = resolveFixed(image, options)
      if (!node) return null

      return {
        ...node,
        image,
        options,
        context,
      }
    },
  }
}

export const fluidNodeType = ({ store, reporter }) => {
  return {
    type: new GraphQLObjectType({
      name: `ContentfulFluid`,
      fields: {
        base64: {
          type: GraphQLString,
          resolve: imageProps => getBase64Image(imageProps, reporter),
        },
        tracedSVG: {
          type: GraphQLString,
          resolve: imageData => getTracedSVG(imageData, { store, reporter }),
        },
        aspectRatio: { type: new GraphQLNonNull(GraphQLFloat) },
        src: { type: new GraphQLNonNull(GraphQLString) },
        srcSet: { type: new GraphQLNonNull(GraphQLString) },
        srcWebp: {
          type: GraphQLString,
          resolve({ image, options }) {
            if (
              image?.file?.contentType === `image/webp` ||
              options.toFormat === `webp`
            ) {
              return null
            }

            const fluid = resolveFluid(image, {
              ...options,
              toFormat: `webp`,
            })
            return fluid?.src
          },
        },
        srcSetWebp: {
          type: GraphQLString,
          resolve({ image, options }) {
            if (
              image?.file?.contentType === `image/webp` ||
              options.toFormat === `webp`
            ) {
              return null
            }

            const fluid = resolveFluid(image, {
              ...options,
              toFormat: `webp`,
            })
            return fluid?.srcSet
          },
        },
        sizes: { type: new GraphQLNonNull(GraphQLString) },
      },
    }),
    args: {
      maxWidth: {
        type: GraphQLInt,
      },
      maxHeight: {
        type: GraphQLInt,
      },
      quality: {
        type: GraphQLInt,
        defaultValue: 50,
      },
      toFormat: {
        type: ImageFormatType,
        defaultValue: ``,
      },
      resizingBehavior: {
        type: ImageResizingBehavior,
      },
      cropFocus: {
        type: ImageCropFocusType,
        defaultValue: null,
      },
      cornerRadius: {
        type: GraphQLInt,
        defaultValue: 0,
        description: stripIndent`
         Desired corner radius in pixels. Results in an image with rounded corners.
         Pass \`-1\` for a full circle/ellipse.`,
      },
      background: {
        type: GraphQLString,
        defaultValue: null,
      },
      sizes: {
        type: GraphQLString,
      },
    },
    resolve(image, options, context) {
      const node = resolveFluid(image, options)
      if (!node) return null

      return {
        ...node,
        image,
        options,
        context,
      }
    },
  }
}

export const resizeNodeType = ({ store, reporter }) => {
  return {
    type: new GraphQLObjectType({
      name: `ContentfulResize`,
      fields: {
        base64: {
          type: GraphQLString,
          resolve: imageProps => getBase64Image(imageProps, reporter),
        },
        tracedSVG: {
          type: GraphQLString,
          resolve: imageData => getTracedSVG(imageData, { store, reporter }),
        },
        src: { type: GraphQLString },
        width: { type: GraphQLInt },
        height: { type: GraphQLInt },
        aspectRatio: { type: GraphQLFloat },
      },
    }),
    args: {
      width: {
        type: GraphQLInt,
      },
      height: {
        type: GraphQLInt,
      },
      quality: {
        type: GraphQLInt,
        defaultValue: 50,
      },
      jpegProgressive: {
        type: GraphQLBoolean,
        defaultValue: true,
      },
      resizingBehavior: {
        type: ImageResizingBehavior,
      },
      toFormat: {
        type: ImageFormatType,
        defaultValue: ``,
      },
      cropFocus: {
        type: ImageCropFocusType,
        defaultValue: null,
      },
      background: {
        type: GraphQLString,
        defaultValue: null,
      },
      cornerRadius: {
        type: GraphQLInt,
        defaultValue: 0,
        description: stripIndent`
         Desired corner radius in pixels. Results in an image with rounded corners.
         Pass \`-1\` for a full circle/ellipse.`,
      },
    },
    resolve(image, options) {
      return resolveResize(image, options)
    },
  }
}
