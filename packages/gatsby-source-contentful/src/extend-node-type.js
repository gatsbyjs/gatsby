const Promise = require(`bluebird`)
const {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLJSON,
  GraphQLNonNull,
} = require(`gatsby/graphql`)
const base64Img = require(`base64-img`)
const _ = require(`lodash`)
const path = require(`path`)
const {
  createUrl,
  getBasicImageProps,
} = require(`./resolve-fixed-and-fluid/helpers/shared-helpers`)

import { resolveFixed, resolveFluid } from "./resolve-fixed-and-fluid"
export { resolveFixed, resolveFluid }

const cacheImage = require(`./cache-image`)

const {
  ImageFormatType,
  ImageResizingBehavior,
  ImageCropFocusType,
} = require(`./schemes`)

export const isImage = image =>
  _.includes(
    [`image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`],
    _.get(image, `file.contentType`)
  )

const getBase64Image = imageProps => {
  if (!imageProps) return null

  const requestUrl = `https:${imageProps.baseUrl}?w=20`
  // TODO add caching.
  return new Promise(resolve => {
    base64Img.requestBase64(requestUrl, (a, b, body) => {
      resolve(body)
    })
  })
}

const resolveResize = (image, options) => {
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

  let pickedHeight = options.height,
    pickedWidth = options.width

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

exports.resolveResize = resolveResize

const fixedNodeType = ({ name, getTracedSVG }) => {
  return {
    type: new GraphQLObjectType({
      name: name,
      fields: {
        base64: {
          type: GraphQLString,
          resolve(imageProps) {
            return getBase64Image(imageProps)
          },
        },
        tracedSVG: {
          type: GraphQLString,
          resolve: getTracedSVG,
        },
        aspectRatio: { type: GraphQLFloat },
        width: { type: new GraphQLNonNull(GraphQLFloat) },
        height: { type: new GraphQLNonNull(GraphQLFloat) },
        src: { type: new GraphQLNonNull(GraphQLString) },
        srcSet: { type: new GraphQLNonNull(GraphQLString) },
        srcWebp: {
          type: GraphQLString,
          resolve({ image, options, context }) {
            if (
              _.get(image, `file.contentType`) === `image/webp` ||
              options.toFormat === `webp`
            ) {
              return null
            }

            const fixed = resolveFixed(image, {
              ...options,
              toFormat: `webp`,
            })
            return _.get(fixed, `src`)
          },
        },
        srcSetWebp: {
          type: GraphQLString,
          resolve({ image, options, context }) {
            if (
              _.get(image, `file.contentType`) === `image/webp` ||
              options.toFormat === `webp`
            ) {
              return null
            }

            const fixed = resolveFixed(image, {
              ...options,
              toFormat: `webp`,
            })
            return _.get(fixed, `srcSet`)
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
      background: {
        type: GraphQLString,
        defaultValue: null,
      },
    },
    resolve: (image, options, context) =>
      Promise.resolve(resolveFixed(image, options)).then(node => {
        if (!node) return null

        return {
          ...node,
          image,
          options,
          context,
        }
      }),
  }
}

const fluidNodeType = ({ name, getTracedSVG }) => {
  return {
    type: new GraphQLObjectType({
      name: name,
      fields: {
        base64: {
          type: GraphQLString,
          resolve(imageProps) {
            return getBase64Image(imageProps)
          },
        },
        tracedSVG: {
          type: GraphQLString,
          resolve: getTracedSVG,
        },
        aspectRatio: { type: new GraphQLNonNull(GraphQLFloat) },
        src: { type: new GraphQLNonNull(GraphQLString) },
        srcSet: { type: new GraphQLNonNull(GraphQLString) },
        srcWebp: {
          type: GraphQLString,
          resolve({ image, options, context }) {
            if (
              _.get(image, `file.contentType`) === `image/webp` ||
              options.toFormat === `webp`
            ) {
              return null
            }

            const fluid = resolveFluid(image, {
              ...options,
              toFormat: `webp`,
            })
            return _.get(fluid, `src`)
          },
        },
        srcSetWebp: {
          type: GraphQLString,
          resolve({ image, options, context }) {
            if (
              _.get(image, `file.contentType`) === `image/webp` ||
              options.toFormat === `webp`
            ) {
              return null
            }

            const fluid = resolveFluid(image, {
              ...options,
              toFormat: `webp`,
            })
            return _.get(fluid, `srcSet`)
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
      background: {
        type: GraphQLString,
        defaultValue: null,
      },
      sizes: {
        type: GraphQLString,
      },
    },
    resolve: (image, options, context) =>
      Promise.resolve(resolveFluid(image, options)).then(node => {
        if (!node) return null

        return {
          ...node,
          image,
          options,
          context,
        }
      }),
  }
}

exports.extendNodeType = ({ type, store }) => {
  if (type.name.match(/contentful.*RichTextNode/)) {
    return {
      nodeType: {
        type: GraphQLString,
        deprecationReason: `This field is deprecated, please use 'json' instead.`,
      },
      json: {
        type: GraphQLJSON,
        resolve: (source, fieldArgs) => {
          const contentJSON = JSON.parse(source.internal.content)
          return contentJSON
        },
      },
    }
  }

  if (type.name !== `ContentfulAsset`) {
    return {}
  }

  const getTracedSVG = async args => {
    const { traceSVG } = require(`gatsby-plugin-sharp`)

    const { image, options } = args
    const {
      file: { contentType },
    } = image

    if (contentType.indexOf(`image/`) !== 0) {
      return null
    }

    const absolutePath = await cacheImage(store, image, options)
    const extension = path.extname(absolutePath)

    return traceSVG({
      file: {
        internal: image.internal,
        name: image.file.fileName,
        extension,
        absolutePath,
      },
      args: { toFormat: `` },
      fileArgs: options,
    })
  }

  // TODO: Remove resolutionsNode and sizesNode for Gatsby v3
  const fixedNode = fixedNodeType({ name: `ContentfulFixed`, getTracedSVG })
  const resolutionsNode = fixedNodeType({
    name: `ContentfulResolutions`,
    getTracedSVG,
  })
  resolutionsNode.deprecationReason = `Resolutions was deprecated in Gatsby v2. It's been renamed to "fixed" https://example.com/write-docs-and-fix-this-example-link`

  const fluidNode = fluidNodeType({ name: `ContentfulFluid`, getTracedSVG })
  const sizesNode = fluidNodeType({ name: `ContentfulSizes`, getTracedSVG })
  sizesNode.deprecationReason = `Sizes was deprecated in Gatsby v2. It's been renamed to "fluid" https://example.com/write-docs-and-fix-this-example-link`

  return {
    fixed: fixedNode,
    resolutions: resolutionsNode,
    fluid: fluidNode,
    sizes: sizesNode,
    resize: {
      type: new GraphQLObjectType({
        name: `ContentfulResize`,
        fields: {
          base64: {
            type: GraphQLString,
            resolve(imageProps) {
              return getBase64Image(imageProps)
            },
          },
          tracedSVG: {
            type: GraphQLString,
            resolve: getTracedSVG,
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
      },
      resolve(image, options, context) {
        return resolveResize(image, options)
      },
    },
  }
}
