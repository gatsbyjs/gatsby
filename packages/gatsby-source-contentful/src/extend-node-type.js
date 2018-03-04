const Promise = require(`bluebird`)
const {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
} = require(`graphql`)
const qs = require(`qs`)
const base64Img = require(`base64-img`)
const _ = require(`lodash`)

const {
  ImageFormatType,
  ImageResizingBehavior,
  ImageCropFocusType,
} = require(`./schemes`)

const isImage = image =>
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

const getBasicImageProps = (image, args) => {
  let aspectRatio
  if (args.width && args.height) {
    aspectRatio = args.width / args.height
  } else {
    aspectRatio =
      image.file.details.image.width / image.file.details.image.height
  }

  return {
    baseUrl: image.file.url,
    contentType: image.file.contentType,
    aspectRatio,
    width: image.file.details.image.width,
    height: image.file.details.image.height,
  }
}

const createUrl = (imgUrl, options = {}) => {
  // Convert to Contentful names and filter out undefined/null values.
  const args = _.pickBy(
    {
      w: options.width,
      h: options.height,
      fl: options.jpegProgressive ? `progressive` : null,
      q: options.quality,
      fm: options.toFormat || ``,
      fit: options.resizingBehavior || ``,
      f: options.cropFocus || ``,
      bg: options.background || ``,
    },
    _.identity
  )
  return `${imgUrl}?${qs.stringify(args)}`
}
exports.createUrl = createUrl

const resolveResponsiveResolution = (image, options) => {
  if (!isImage(image)) return null

  const { baseUrl, width, aspectRatio } = getBasicImageProps(image, options)

  let desiredAspectRatio = aspectRatio

  // If we're cropping, calculate the specified aspect ratio.
  if (options.height) {
    desiredAspectRatio = options.width / options.height
  }

  // If the user selected a height (so cropping) and fit option
  // is not set, we'll set our defaults
  if (options.height) {
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
  let sizes = []
  sizes.push(options.width)
  sizes.push(options.width * 1.5)
  sizes.push(options.width * 2)
  sizes.push(options.width * 3)
  sizes = sizes.map(Math.round)

  // Filter out sizes larger than the image's width.
  const filteredSizes = sizes.filter(size => size < width)

  // Sort sizes for prettiness.
  const sortedSizes = _.sortBy(filteredSizes)

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
  if (options.height) {
    pickedHeight = options.height
  } else {
    pickedHeight = options.width / desiredAspectRatio
  }

  return {
    aspectRatio: desiredAspectRatio,
    baseUrl,
    width: Math.round(options.width),
    height: Math.round(pickedHeight),
    src: createUrl(baseUrl, {
      ...options,
      width: options.width,
    }),
    srcSet,
  }
}
exports.resolveResponsiveResolution = resolveResponsiveResolution

const resolveResponsiveSizes = (image, options) => {
  if (!isImage(image)) return null

  const { baseUrl, width, aspectRatio } = getBasicImageProps(image, options)

  let desiredAspectRatio = aspectRatio

  // If we're cropping, calculate the specified aspect ratio.
  if (options.maxHeight) {
    desiredAspectRatio = options.maxWidth / options.maxHeight
  }

  // If the users didn't set a default sizes, we'll make one.
  if (!options.sizes) {
    options.sizes = `(max-width: ${options.maxWidth}px) 100vw, ${
      options.maxWidth
    }px`
  }

  // Create sizes (in width) for the image. If the max width of the container
  // for the rendered markdown file is 800px, the sizes would then be: 200,
  // 400, 800, 1200, 1600, 2400.
  //
  // This is enough sizes to provide close to the optimal image size for every
  // device size / screen resolution
  let sizes = []
  sizes.push(options.maxWidth / 4)
  sizes.push(options.maxWidth / 2)
  sizes.push(options.maxWidth)
  sizes.push(options.maxWidth * 1.5)
  sizes.push(options.maxWidth * 2)
  sizes.push(options.maxWidth * 3)
  sizes = sizes.map(Math.round)

  // Filter out sizes larger than the image's maxWidth.
  const filteredSizes = sizes.filter(size => size < width)

  // Add the original image to ensure the largest image possible
  // is available for small images.
  filteredSizes.push(width)

  // Sort sizes for prettiness.
  const sortedSizes = _.sortBy(filteredSizes)

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
exports.resolveResponsiveSizes = resolveResponsiveSizes

const resolveResize = (image, options) => {
  if (!isImage(image)) return null

  const { baseUrl, aspectRatio } = getBasicImageProps(image, options)

  // If the user selected a height (so cropping) and fit option
  // is not set, we'll set our defaults
  if (options.height) {
    if (!options.resizingBehavior) {
      options.resizingBehavior = `fill`
    }
  }

  const pickedWidth = options.width
  let pickedHeight
  if (options.height) {
    pickedHeight = options.height
  } else {
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

exports.extendNodeType = ({ type }) => {
  if (type.name !== `ContentfulAsset`) {
    return {}
  }

  return {
    resolutions: {
      type: new GraphQLObjectType({
        name: `ContentfulResolutions`,
        fields: {
          base64: {
            type: GraphQLString,
            resolve(imageProps) {
              return getBase64Image(imageProps)
            },
          },
          aspectRatio: { type: GraphQLFloat },
          width: { type: GraphQLFloat },
          height: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString },
          srcWebp: {
            type: GraphQLString,
            resolve({ image, options, context }) {
              if (
                _.get(image, `file.contentType`) === `image/webp` ||
                options.toFormat === `webp`
              ) {
                return null
              }

              const resolutions = resolveResponsiveResolution(image, {
                ...options,
                toFormat: `webp`,
              })
              return _.get(resolutions, `src`)
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

              const resolutions = resolveResponsiveResolution(image, {
                ...options,
                toFormat: `webp`,
              })
              return _.get(resolutions, `srcSet`)
            },
          },
        },
      }),
      args: {
        width: {
          type: GraphQLInt,
          defaultValue: 400,
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
        Promise.resolve(resolveResponsiveResolution(image, options)).then(
          node => {
            return {
              ...node,
              image,
              options,
              context,
            }
          }
        ),
    },
    sizes: {
      type: new GraphQLObjectType({
        name: `ContentfulSizes`,
        fields: {
          base64: {
            type: GraphQLString,
            resolve(imageProps) {
              return getBase64Image(imageProps)
            },
          },
          aspectRatio: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString },
          srcWebp: {
            type: GraphQLString,
            resolve({ image, options, context }) {
              if (
                _.get(image, `file.contentType`) === `image/webp` ||
                options.toFormat === `webp`
              ) {
                return null
              }

              const sizes = resolveResponsiveSizes(image, {
                ...options,
                toFormat: `webp`,
              })
              return _.get(sizes, `src`)
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

              const sizes = resolveResponsiveSizes(image, {
                ...options,
                toFormat: `webp`,
              })
              return _.get(sizes, `srcSet`)
            },
          },
          sizes: { type: GraphQLString },
        },
      }),
      args: {
        maxWidth: {
          type: GraphQLInt,
          defaultValue: 800,
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
        Promise.resolve(resolveResponsiveSizes(image, options)).then(node => {
          return {
            ...node,
            image,
            options,
            context,
          }
        }),
    },
    responsiveResolution: {
      deprecationReason: `We dropped the "responsive" part of the name to make it shorter https://github.com/gatsbyjs/gatsby/pull/2320/`,
      type: new GraphQLObjectType({
        name: `ContentfulResponsiveResolution`,
        fields: {
          base64: {
            type: GraphQLString,
            resolve(imageProps) {
              return getBase64Image(imageProps)
            },
          },
          aspectRatio: { type: GraphQLFloat },
          width: { type: GraphQLFloat },
          height: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString },
        },
      }),
      args: {
        width: {
          type: GraphQLInt,
          defaultValue: 400,
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
      resolve(image, options, context) {
        return resolveResponsiveResolution(image, options)
      },
    },
    responsiveSizes: {
      deprecationReason: `We dropped the "responsive" part of the name to make it shorter https://github.com/gatsbyjs/gatsby/pull/2320/`,
      type: new GraphQLObjectType({
        name: `ContentfulResponsiveSizes`,
        fields: {
          base64: {
            type: GraphQLString,
            resolve(imageProps) {
              return getBase64Image(imageProps)
            },
          },
          aspectRatio: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString },
          sizes: { type: GraphQLString },
        },
      }),
      args: {
        maxWidth: {
          type: GraphQLInt,
          defaultValue: 800,
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
        sizes: {
          type: GraphQLString,
        },
        background: {
          type: GraphQLString,
          defaultValue: null,
        },
      },
      resolve(image, options, context) {
        return resolveResponsiveSizes(image, options)
      },
    },
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
          src: { type: GraphQLString },
          width: { type: GraphQLInt },
          height: { type: GraphQLInt },
          aspectRatio: { type: GraphQLFloat },
        },
      }),
      args: {
        width: {
          type: GraphQLInt,
          defaultValue: 400,
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
