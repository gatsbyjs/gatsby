const Promise = require(`bluebird`)
const {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLEnumType,
} = require(`graphql`)
const qs = require(`qs`)
const base64Img = require(`base64-img`)
const _ = require(`lodash`)

const ImageFormatType = new GraphQLEnumType({
  name: `ImageFormat`,
  values: {
    NO_CHANGE: { value: `` },
    JPG: { value: `jpg` },
    PNG: { value: `png` },
    WEBP: { value: `webp` },
  },
})

const ImageCropFocusType = new GraphQLEnumType({
  name: `ImageCropFocus`,
  values: {
    TOP: { value: `top` },
    TOP_LEFT: { value: `top_left` },
    TOP_RIGHT: { value: `top_right` },
    BOTTOM: { value: `bottom` },
    BOTTOM_RIGHT: { value: `bottom_left` },
    BOTTOM_LEFT: { value: `bottom_right` },
    RIGHT: { value: `right` },
    LEFT: { value: `left` },
    FACES: { value: `faces` },
  },
})

const isImage = image =>
  _.includes(
    [`image/jpeg`, `image/jpg`, `image/png`, `image/webp`],
    image.file.contentType
  )

const getBase64Image = (imgUrl, args = {}) => {
  const requestUrl = `https:${imgUrl}?w=20`
  // TODO add caching.
  const urlArgs = { width: 20, height: 20 / args.aspectRatio }
  return new Promise(resolve => {
    base64Img.requestBase64(requestUrl, (a, b, body) => {
      resolve(body)
    })
  })
}

const getBase64ImageAndBasicMeasurements = (image, args) => new Promise(resolve => {
    getBase64Image(image.file.url, args).then(base64Str => {
      let aspectRatio
      if (args.width && args.height) {
        aspectRatio = args.width / args.height
      } else {
        aspectRatio =
          image.file.details.image.width / image.file.details.image.height
      }

      resolve({
        base64Str,
        aspectRatio,
        width: image.file.details.image.width,
        height: image.file.details.image.height,
      })
    })
  })
const createUrl = (imgUrl, options = {}) => {
  // Convert to Contentful names and filter out undefined/null values.
  const args = _.pickBy(
    {
      w: options.width,
      h: options.height,
      fl: options.jpegProgressive ? `progressive` : null,
      q: options.quality,
      fm: options.toFormat ? options.toFormat : ``,
    },
    _.identity
  )
  return `${imgUrl}?${qs.stringify(args)}`
}
exports.createUrl = createUrl

const resolveResponsiveResolution = (image, options) => {
  if (isImage(image)) {
    return new Promise(resolve => {
      getBase64ImageAndBasicMeasurements(
        image,
        options
      ).then(({ base64Str, width, height, aspectRatio }) => {
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
            return `${createUrl(image.file.url, {
              width: size,
            })} ${resolution}`
          })
          .join(`,\n`)

        const pickedWidth = options.width
        let pickedHeight
        if (options.height) {
          pickedHeight = options.height
        } else {
          pickedHeight = pickedWidth / aspectRatio
        }

        return resolve({
          base64: base64Str,
          aspectRatio: aspectRatio,
          width: pickedWidth,
          height: pickedHeight,
          src: createUrl(image.file.url, { width: options.width }),
          srcSet,
        })
      })
    })
    return null
  }
}
exports.resolveResponsiveResolution = resolveResponsiveResolution

const resolveResponsiveSizes = (image, options) => {
  if (isImage(image)) {
    return new Promise(resolve => {
      getBase64ImageAndBasicMeasurements(
        image,
        options
      ).then(({ base64Str, width, height, aspectRatio }) => {
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
          .map(
            width =>
              `${createUrl(image.file.url, { width })} ${Math.round(width)}w`
          )
          .join(`,\n`)

        return resolve({
          base64: base64Str,
          aspectRatio: aspectRatio,
          src: createUrl(image.file.url, { width: options.maxWidth }),
          srcSet,
          sizes: options.sizes,
        })
      })
    })
    return null
  }
}
exports.resolveResponsiveSizes = resolveResponsiveSizes

const resolveResize = (image, options) => new Promise(resolve => {
    if (isImage(image)) {
      getBase64ImageAndBasicMeasurements(
        image,
        options
      ).then(({ base64Str, width, height, aspectRatio }) => {
        if (options.base64) {
          return resolve(base64Str)
        } else {
          const pickedWidth = options.width
          let pickedHeight
          if (options.height) {
            pickedHeight = options.height
          } else {
            pickedHeight = pickedWidth / aspectRatio
          }
          resolve({
            src: createUrl(image.file.url, options),
            width: pickedWidth,
            height: pickedHeight,
            aspectRatio,
            base64: base64Str,
          })
        }
      })
    } else {
      resolve()
    }
  })

exports.resolveResize = resolveResize

exports.extendNodeType = ({ type }) => {
  if (type.name !== `contentful__Asset`) {
    return {}
  }

  return {
    responsiveResolution: {
      type: new GraphQLObjectType({
        name: `ContentfulResponsiveResolution`,
        fields: {
          base64: { type: GraphQLString },
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
        cropFocus: {
          type: ImageCropFocusType,
          defaultValue: null,
        },
      },
      resolve(image, options, context) {
        return resolveResponsiveResolution(image, options)
      },
    },
    responsiveSizes: {
      type: new GraphQLObjectType({
        name: `ContentfulResponsiveSizes`,
        fields: {
          base64: { type: GraphQLString },
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
        cropFocus: {
          type: ImageCropFocusType,
          defaultValue: null,
        },
        sizes: {
          type: GraphQLString,
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
        pngCompressionLevel: {
          type: GraphQLInt,
          defaultValue: 9,
        },
        base64: {
          type: GraphQLBoolean,
          defaultValue: false,
        },
        toFormat: {
          type: ImageFormatType,
          defaultValue: ``,
        },
        cropFocus: {
          type: ImageCropFocusType,
          defaultValue: null,
        },
      },
      resolve(image, options, context) {
        return resolveResize(image, options)
      },
    },
  }
}
