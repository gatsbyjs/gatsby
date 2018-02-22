const Promise = require(`bluebird`)
const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLEnumType,
} = require(`graphql`)
const {
  queueImageResizing,
  base64,
  sizes,
  resolutions,
  traceSVG,
} = require(`gatsby-plugin-sharp`)

const sharp = require(`sharp`)
const fs = require(`fs`)
const fsExtra = require(`fs-extra`)
const imageSize = require(`probe-image-size`)
const path = require(`path`)
const Potrace = require(`potrace`).Potrace

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
    CENTER: { value: sharp.gravity.center },
    NORTH: { value: sharp.gravity.north },
    NORTHEAST: { value: sharp.gravity.northeast },
    EAST: { value: sharp.gravity.east },
    SOUTHEAST: { value: sharp.gravity.southeast },
    SOUTH: { value: sharp.gravity.south },
    SOUTHWEST: { value: sharp.gravity.southwest },
    WEST: { value: sharp.gravity.west },
    NORTHWEST: { value: sharp.gravity.northwest },
    ENTROPY: { value: sharp.strategy.entropy },
    ATTENTION: { value: sharp.strategy.attention },
  },
})

const DuotoneGradientType = new GraphQLInputObjectType({
  name: `DuotoneGradient`,
  fields: () => {
    return {
      highlight: { type: GraphQLString },
      shadow: { type: GraphQLString },
      opacity: { type: GraphQLInt },
    }
  },
})

const PotraceType = new GraphQLInputObjectType({
  name: `Potrace`,
  fields: () => {
    return {
      turnPolicy: {
        type: new GraphQLEnumType({
          name: `PotraceTurnPolicy`,
          values: {
            TURNPOLICY_BLACK: { value: Potrace.TURNPOLICY_BLACK },
            TURNPOLICY_WHITE: { value: Potrace.TURNPOLICY_WHITE },
            TURNPOLICY_LEFT: { value: Potrace.TURNPOLICY_LEFT },
            TURNPOLICY_RIGHT: { value: Potrace.TURNPOLICY_RIGHT },
            TURNPOLICY_MINORITY: { value: Potrace.TURNPOLICY_MINORITY },
            TURNPOLICY_MAJORITY: { value: Potrace.TURNPOLICY_MAJORITY },
          },
        }),
      },
      turdSize: { type: GraphQLFloat },
      alphaMax: { type: GraphQLFloat },
      optCurve: { type: GraphQLBoolean },
      optTolerance: { type: GraphQLFloat },
      threshold: { type: GraphQLInt },
      blackOnWhite: { type: GraphQLBoolean },
      color: { type: GraphQLString },
      background: { type: GraphQLString },
    }
  },
})

function toArray(buf) {
  var arr = new Array(buf.length)

  for (var i = 0; i < buf.length; i++) {
    arr[i] = buf[i]
  }

  return arr
}

module.exports = ({
  type,
  pathPrefix,
  getNodeAndSavePathDependency,
  reporter,
}) => {
  if (type.name !== `ImageSharp`) {
    return {}
  }

  const getTracedSVG = async ({ file, image, fieldArgs }) =>
    traceSVG({
      file,
      args: { ...fieldArgs.traceSVG },
      fileArgs: fieldArgs,
    })

  return {
    original: {
      type: new GraphQLObjectType({
        name: `ImageSharpOriginal`,
        fields: {
          width: { type: GraphQLFloat },
          height: { type: GraphQLFloat },
          src: { type: GraphQLString },
        },
      }),
      args: {},
      async resolve(image, fieldArgs, context) {
        const details = getNodeAndSavePathDependency(image.parent, context.path)
        const dimensions = imageSize.sync(
          toArray(fs.readFileSync(details.absolutePath))
        )
        const imageName = `${details.name}-${image.internal.contentDigest}${
          details.ext
        }`
        const publicPath = path.join(
          process.cwd(),
          `public`,
          `static`,
          imageName
        )

        if (!fsExtra.existsSync(publicPath)) {
          fsExtra.copy(details.absolutePath, publicPath, err => {
            if (err) {
              console.error(
                `error copying file from ${
                  details.absolutePath
                } to ${publicPath}`,
                err
              )
            }
          })
        }

        return {
          width: dimensions.width,
          height: dimensions.height,
          src: `${pathPrefix}/static/${imageName}`,
        }
      },
    },
    resolutions: {
      type: new GraphQLObjectType({
        name: `ImageSharpResolutions`,
        fields: {
          base64: { type: GraphQLString },
          tracedSVG: {
            type: GraphQLString,
            resolve: parent => getTracedSVG(parent),
          },
          aspectRatio: { type: GraphQLFloat },
          width: { type: GraphQLFloat },
          height: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString },
          srcWebp: {
            type: GraphQLString,
            resolve: ({ file, image, fieldArgs }) => {
              // If the file is already in webp format or should explicitly
              // be converted to webp, we do not create additional webp files
              if (image.extension === `webp` || fieldArgs.toFormat === `webp`) {
                return null
              }
              const args = { ...fieldArgs, pathPrefix, toFormat: `webp` }
              return Promise.resolve(
                resolutions({
                  file,
                  args,
                  reporter,
                })
              ).then(({ src }) => src)
            },
          },
          srcSetWebp: {
            type: GraphQLString,
            resolve: ({ file, image, fieldArgs }) => {
              if (image.extension === `webp` || fieldArgs.toFormat === `webp`) {
                return null
              }
              const args = { ...fieldArgs, pathPrefix, toFormat: `webp` }
              return Promise.resolve(
                resolutions({
                  file,
                  args,
                  reporter,
                })
              ).then(({ srcSet }) => srcSet)
            },
          },
          originalName: { type: GraphQLString },
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
        jpegProgressive: {
          type: GraphQLBoolean,
          defaultValue: true,
        },
        grayscale: {
          type: GraphQLBoolean,
          defaultValue: false,
        },
        duotone: {
          type: DuotoneGradientType,
          defaultValue: false,
        },
        traceSVG: {
          type: PotraceType,
          defaultValue: false,
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
          defaultValue: sharp.strategy.attention,
        },
        rotate: {
          type: GraphQLInt,
          defaultValue: 0,
        },
      },
      resolve: (image, fieldArgs, context) => {
        const file = getNodeAndSavePathDependency(image.parent, context.path)
        const args = { ...fieldArgs, pathPrefix }
        return Promise.resolve(
          resolutions({
            file,
            args,
            reporter,
          })
        ).then(o =>
          Object.assign({}, o, {
            fieldArgs: args,
            image,
            file,
          })
        )
      },
    },
    sizes: {
      type: new GraphQLObjectType({
        name: `ImageSharpSizes`,
        fields: {
          base64: { type: GraphQLString },
          tracedSVG: {
            type: GraphQLString,
            resolve: parent => getTracedSVG(parent),
          },
          aspectRatio: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString },
          srcWebp: {
            type: GraphQLString,
            resolve: ({ file, image, fieldArgs }) => {
              if (image.extension === `webp` || fieldArgs.toFormat === `webp`) {
                return null
              }
              const args = { ...fieldArgs, pathPrefix, toFormat: `webp` }
              return Promise.resolve(
                sizes({
                  file,
                  args,
                  reporter,
                })
              ).then(({ src }) => src)
            },
          },
          srcSetWebp: {
            type: GraphQLString,
            resolve: ({ file, image, fieldArgs }) => {
              if (image.extension === `webp` || fieldArgs.toFormat === `webp`) {
                return null
              }
              const args = { ...fieldArgs, pathPrefix, toFormat: `webp` }
              return Promise.resolve(
                sizes({
                  file,
                  args,
                  reporter,
                })
              ).then(({ srcSet }) => srcSet)
            },
          },
          sizes: { type: GraphQLString },
          originalImg: { type: GraphQLString },
          originalName: { type: GraphQLString },
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
        grayscale: {
          type: GraphQLBoolean,
          defaultValue: false,
        },
        jpegProgressive: {
          type: GraphQLBoolean,
          defaultValue: true,
        },
        duotone: {
          type: DuotoneGradientType,
          defaultValue: false,
        },
        traceSVG: {
          type: PotraceType,
          defaultValue: false,
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
          defaultValue: sharp.strategy.attention,
        },
        rotate: {
          type: GraphQLInt,
          defaultValue: 0,
        },
      },
      resolve: (image, fieldArgs, context) => {
        const file = getNodeAndSavePathDependency(image.parent, context.path)
        const args = { ...fieldArgs, pathPrefix }
        return Promise.resolve(
          sizes({
            file,
            args,
            reporter,
          })
        ).then(o =>
          Object.assign({}, o, {
            fieldArgs: args,
            image,
            file,
          })
        )
      },
    },
    responsiveResolution: {
      deprecationReason: `We dropped the "responsive" part of the name to make it shorter https://github.com/gatsbyjs/gatsby/pull/2320/`,
      type: new GraphQLObjectType({
        name: `ImageSharpResponsiveResolution`,
        fields: {
          base64: { type: GraphQLString },
          aspectRatio: { type: GraphQLFloat },
          width: { type: GraphQLFloat },
          height: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString },
          originalName: { type: GraphQLString },
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
        jpegProgressive: {
          type: GraphQLBoolean,
          defaultValue: true,
        },
        grayscale: {
          type: GraphQLBoolean,
          defaultValue: false,
        },
        duotone: {
          type: DuotoneGradientType,
          defaultValue: false,
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
          defaultValue: sharp.strategy.attention,
        },
        rotate: {
          type: GraphQLInt,
          defaultValue: 0,
        },
      },
      resolve: (image, fieldArgs, context) => {
        const file = getNodeAndSavePathDependency(image.parent, context.path)
        const args = { ...fieldArgs, pathPrefix }
        return Promise.resolve(
          resolutions({
            file,
            args,
            reporter,
          })
        ).then(o =>
          Object.assign({}, o, {
            fieldArgs: args,
            image,
            file,
          })
        )
      },
    },
    responsiveSizes: {
      deprecationReason: `We dropped the "responsive" part of the name to make it shorter https://github.com/gatsbyjs/gatsby/pull/2320/`,
      type: new GraphQLObjectType({
        name: `ImageSharpResponsiveSizes`,
        fields: {
          base64: { type: GraphQLString },
          aspectRatio: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString },
          sizes: { type: GraphQLString },
          originalImg: { type: GraphQLString },
          originalName: { type: GraphQLString },
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
        grayscale: {
          type: GraphQLBoolean,
          defaultValue: false,
        },
        jpegProgressive: {
          type: GraphQLBoolean,
          defaultValue: true,
        },
        duotone: {
          type: DuotoneGradientType,
          defaultValue: false,
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
          defaultValue: sharp.strategy.attention,
        },
        rotate: {
          type: GraphQLInt,
          defaultValue: 0,
        },
      },
      resolve: (image, fieldArgs, context) => {
        const file = getNodeAndSavePathDependency(image.parent, context.path)
        const args = { ...fieldArgs, pathPrefix }
        return Promise.resolve(
          sizes({
            file,
            args,
            reporter,
          })
        ).then(o =>
          Object.assign({}, o, {
            fieldArgs: args,
            image,
            file,
          })
        )
      },
    },
    resize: {
      type: new GraphQLObjectType({
        name: `ImageSharpResize`,
        fields: {
          src: { type: GraphQLString },
          tracedSVG: {
            type: GraphQLString,
            resolve: parent => getTracedSVG(parent),
          },
          width: { type: GraphQLInt },
          height: { type: GraphQLInt },
          aspectRatio: { type: GraphQLFloat },
          originalName: { type: GraphQLString },
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
        grayscale: {
          type: GraphQLBoolean,
          defaultValue: false,
        },
        duotone: {
          type: DuotoneGradientType,
          defaultValue: false,
        },
        base64: {
          type: GraphQLBoolean,
          defaultValue: false,
        },
        traceSVG: {
          type: PotraceType,
          defaultValue: false,
        },
        toFormat: {
          type: ImageFormatType,
          defaultValue: ``,
        },
        cropFocus: {
          type: ImageCropFocusType,
          defaultValue: sharp.strategy.attention,
        },
        rotate: {
          type: GraphQLInt,
          defaultValue: 0,
        },
      },
      resolve: (image, fieldArgs, context) => {
        const file = getNodeAndSavePathDependency(image.parent, context.path)
        const args = { ...fieldArgs, pathPrefix }
        return new Promise(resolve => {
          if (fieldArgs.base64) {
            resolve(
              base64({
                file,
              })
            )
          } else {
            const o = queueImageResizing({
              file,
              args,
            })
            resolve(
              Object.assign({}, o, {
                image,
                file,
                fieldArgs: args,
              })
            )
          }
        })
      },
    },
  }
}
