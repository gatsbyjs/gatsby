const Promise = require(`bluebird`)
const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLJSON,
} = require(`gatsby/graphql`)
const {
  queueImageResizing,
  base64,
  fluid,
  fixed,
  traceSVG,
  generateImageData,
} = require(`gatsby-plugin-sharp`)
const { hasFeature } = require(`gatsby-plugin-utils`)

const sharp = require(`./safe-sharp`)
const fs = require(`fs-extra`)
const imageSize = require(`probe-image-size`)
const path = require(`path`)

const DEFAULT_PNG_COMPRESSION_SPEED = 4

const {
  ImageFormatType,
  ImageCropFocusType,
  DuotoneGradientType,
  PotraceTurnPolicyType,
  PotraceType,
  ImageFitType,
  ImageLayoutType,
  ImagePlaceholderType,
  JPGOptionsType,
  PNGOptionsType,
  WebPOptionsType,
  BlurredOptionsType,
  TransformOptionsType,
  AVIFOptionsType,
} = require(`./types`)
const { stripIndent } = require(`common-tags`)
const { prefixId, CODES } = require(`./error-utils`)

let warnedForDeprecation = false

function warnForDeprecation() {
  if (warnedForDeprecation) {
    return
  }
  warnedForDeprecation = true
  console.warn(
    `[gatsby-transformer-sharp] The "fixed" and "fluid" resolvers are now deprecated. Switch to "gatsby-plugin-image" for better performance and a simpler API. See https://gatsby.dev/migrate-images to learn how.`
  )
}

function toArray(buf) {
  const arr = new Array(buf.length)

  for (let i = 0; i < buf.length; i++) {
    arr[i] = buf[i]
  }

  return arr
}

const getTracedSVG = async ({ file, image, fieldArgs, cache, reporter }) =>
  traceSVG({
    file,
    args: { ...fieldArgs.traceSVG },
    fileArgs: fieldArgs,
    cache,
    reporter,
  })

const fixedNodeType = ({
  pathPrefix,
  getNodeAndSavePathDependency,
  reporter,
  name,
  cache,
}) => {
  return {
    type: new GraphQLObjectType({
      name: name,
      fields: {
        base64: { type: GraphQLString },
        tracedSVG: {
          type: GraphQLString,
          resolve: parent =>
            getTracedSVG({
              ...parent,
              cache,
              reporter,
            }),
        },
        aspectRatio: { type: GraphQLFloat },
        width: { type: new GraphQLNonNull(GraphQLFloat) },
        height: { type: new GraphQLNonNull(GraphQLFloat) },
        src: { type: new GraphQLNonNull(GraphQLString) },
        srcSet: { type: new GraphQLNonNull(GraphQLString) },
        srcWebp: {
          type: GraphQLString,
          resolve: ({ file, image, fieldArgs }) => {
            // If the file is already in webp format or should explicitly
            // be converted to webp, we do not create additional webp files
            if (file.extension === `webp` || fieldArgs.toFormat === `webp`) {
              return null
            }
            const args = { ...fieldArgs, pathPrefix, toFormat: `webp` }
            return Promise.resolve(
              fixed({
                file,
                args,
                reporter,
                cache,
              })
            ).then(({ src }) => src)
          },
        },
        srcSetWebp: {
          type: GraphQLString,
          resolve: ({ file, image, fieldArgs }) => {
            if (file.extension === `webp` || fieldArgs.toFormat === `webp`) {
              return null
            }
            const args = { ...fieldArgs, pathPrefix, toFormat: `webp` }
            return Promise.resolve(
              fixed({
                file,
                args,
                reporter,
                cache,
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
      },
      height: {
        type: GraphQLInt,
      },
      base64Width: {
        type: GraphQLInt,
      },
      jpegProgressive: {
        type: GraphQLBoolean,
        defaultValue: true,
      },
      pngCompressionSpeed: {
        type: GraphQLInt,
        defaultValue: DEFAULT_PNG_COMPRESSION_SPEED,
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
      },
      jpegQuality: {
        type: GraphQLInt,
      },
      pngQuality: {
        type: GraphQLInt,
      },
      webpQuality: {
        type: GraphQLInt,
      },
      toFormat: {
        type: ImageFormatType,
        defaultValue: ``,
      },
      toFormatBase64: {
        type: ImageFormatType,
        defaultValue: ``,
      },
      cropFocus: {
        type: ImageCropFocusType,
        defaultValue: sharp.strategy.attention,
      },
      fit: {
        type: ImageFitType,
        defaultValue: sharp.fit.cover,
      },
      background: {
        type: GraphQLString,
        defaultValue: `rgba(0,0,0,1)`,
      },
      rotate: {
        type: GraphQLInt,
        defaultValue: 0,
      },
      trim: {
        type: GraphQLFloat,
        defaultValue: false,
      },
    },
    resolve: (image, fieldArgs, context) => {
      warnForDeprecation()
      const file = getNodeAndSavePathDependency(image.parent, context.path)
      const args = { ...fieldArgs, pathPrefix }
      return Promise.resolve(
        fixed({
          file,
          args,
          reporter,
          cache,
        })
      ).then(o =>
        Object.assign({}, o, {
          fieldArgs: args,
          image,
          file,
        })
      )
    },
  }
}

const fluidNodeType = ({
  pathPrefix,
  getNodeAndSavePathDependency,
  reporter,
  name,
  cache,
}) => {
  return {
    type: new GraphQLObjectType({
      name: name,
      fields: {
        base64: { type: GraphQLString },
        tracedSVG: {
          type: GraphQLString,
          resolve: parent =>
            getTracedSVG({
              ...parent,
              cache,
              reporter,
            }),
        },
        aspectRatio: { type: new GraphQLNonNull(GraphQLFloat) },
        src: { type: new GraphQLNonNull(GraphQLString) },
        srcSet: { type: new GraphQLNonNull(GraphQLString) },
        srcWebp: {
          type: GraphQLString,
          resolve: ({ file, image, fieldArgs }) => {
            if (image.extension === `webp` || fieldArgs.toFormat === `webp`) {
              return null
            }
            const args = { ...fieldArgs, pathPrefix, toFormat: `webp` }
            return Promise.resolve(
              fluid({
                file,
                args,
                reporter,
                cache,
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
              fluid({
                file,
                args,
                reporter,
                cache,
              })
            ).then(({ srcSet }) => srcSet)
          },
        },
        sizes: { type: new GraphQLNonNull(GraphQLString) },
        originalImg: { type: GraphQLString },
        originalName: { type: GraphQLString },
        presentationWidth: { type: new GraphQLNonNull(GraphQLInt) },
        presentationHeight: { type: new GraphQLNonNull(GraphQLInt) },
      },
    }),
    args: {
      maxWidth: {
        type: GraphQLInt,
      },
      maxHeight: {
        type: GraphQLInt,
      },
      base64Width: {
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
      pngCompressionSpeed: {
        type: GraphQLInt,
        defaultValue: DEFAULT_PNG_COMPRESSION_SPEED,
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
      },
      jpegQuality: {
        type: GraphQLInt,
      },
      pngQuality: {
        type: GraphQLInt,
      },
      webpQuality: {
        type: GraphQLInt,
      },
      toFormat: {
        type: ImageFormatType,
        defaultValue: ``,
      },
      toFormatBase64: {
        type: ImageFormatType,
        defaultValue: ``,
      },
      cropFocus: {
        type: ImageCropFocusType,
        defaultValue: sharp.strategy.attention,
      },
      fit: {
        type: ImageFitType,
        defaultValue: sharp.fit.cover,
      },
      background: {
        type: GraphQLString,
        defaultValue: `rgba(0,0,0,1)`,
      },
      rotate: {
        type: GraphQLInt,
        defaultValue: 0,
      },
      trim: {
        type: GraphQLFloat,
        defaultValue: false,
      },
      sizes: {
        type: GraphQLString,
        defaultValue: ``,
      },
      srcSetBreakpoints: {
        type: GraphQLList(GraphQLInt),
        defaultValue: [],
        description: `A list of image widths to be generated. Example: [ 200, 340, 520, 890 ]`,
      },
    },
    resolve: (image, fieldArgs, context) => {
      warnForDeprecation()
      const file = getNodeAndSavePathDependency(image.parent, context.path)
      const args = { ...fieldArgs, pathPrefix }
      return Promise.resolve(
        fluid({
          file,
          args,
          reporter,
          cache,
        })
      ).then(o =>
        Object.assign({}, o, {
          fieldArgs: args,
          image,
          file,
        })
      )
    },
  }
}

const imageNodeType = ({
  pathPrefix,
  getNodeAndSavePathDependency,
  reporter,
  cache,
}) => {
  return {
    type: hasFeature(`graphql-typegen`)
      ? `GatsbyImageData!`
      : new GraphQLNonNull(GraphQLJSON),
    args: {
      layout: {
        type: ImageLayoutType,
        defaultValue: `constrained`,
        description: stripIndent`
        The layout for the image.
        FIXED: A static image sized, that does not resize according to the screen width
        FULL_WIDTH: The image resizes to fit its container. Pass a "sizes" option if it isn't going to be the full width of the screen.
        CONSTRAINED: Resizes to fit its container, up to a maximum width, at which point it will remain fixed in size.
        `,
      },
      width: {
        type: GraphQLInt,
        description: stripIndent`
        The display width of the generated image for layout = FIXED, and the maximum display width of the largest image for layout = CONSTRAINED.
        Ignored if layout = FLUID.
        `,
      },
      height: {
        type: GraphQLInt,
        description: stripIndent`
        The display height of the generated image for layout = FIXED, and the maximum display height of the largest image for layout = CONSTRAINED.
        The image will be cropped if the aspect ratio does not match the source image. If omitted, it is calculated from the supplied width,
        matching the aspect ratio of the source image.`,
      },
      aspectRatio: {
        type: GraphQLFloat,
        description: stripIndent`
        If set along with width or height, this will set the value of the other dimension to match the provided aspect ratio, cropping the image if needed.
        If neither width or height is provided, height will be set based on the intrinsic width of the source image.
        `,
      },
      placeholder: {
        type: ImagePlaceholderType,
        description: stripIndent`
        Format of generated placeholder image, displayed while the main image loads.
        BLURRED: a blurred, low resolution image, encoded as a base64 data URI (default)
        DOMINANT_COLOR: a solid color, calculated from the dominant color of the image.
        TRACED_SVG: a low-resolution traced SVG of the image.
        NONE: no placeholder. Set "background" to use a fixed background color.`,
      },
      blurredOptions: {
        type: BlurredOptionsType,
        description: `Options for the low-resolution placeholder image. Set placeholder to "BLURRED" to use this`,
      },
      tracedSVGOptions: {
        type: PotraceType,
        description: `Options for traced placeholder SVGs. You also should set placeholder to "TRACED_SVG".`,
      },
      formats: {
        type: GraphQLList(ImageFormatType),
        description: stripIndent`
        The image formats to generate. Valid values are "AUTO" (meaning the same format as the source image), "JPG", "PNG", "WEBP" and "AVIF".
        The default value is [AUTO, WEBP], and you should rarely need to change this. Take care if you specify JPG or PNG when you do
        not know the formats of the source images, as this could lead to unwanted results such as converting JPEGs to PNGs. Specifying
        both PNG and JPG is not supported and will be ignored.
        `,
      },
      outputPixelDensities: {
        type: GraphQLList(GraphQLFloat),
        description: stripIndent`
        A list of image pixel densities to generate. It will never generate images larger than the source, and will always include a 1x image.
        Default is [ 1, 2 ] for FIXED images, meaning 1x and 2x and [0.25, 0.5, 1, 2] for CONSTRAINED. In this case, an image with a constrained layout
        and width = 400 would generate images at 100, 200, 400 and 800px wide. Ignored for FULL_WIDTH images, which use breakpoints instead`,
      },
      breakpoints: {
        type: GraphQLList(GraphQLInt),
        description: stripIndent`
        Specifies the image widths to generate. For FIXED and CONSTRAINED images it is better to allow these to be determined automatically,
        based on the image size. For FULL_WIDTH images this can be used to override the default, which is [750, 1080, 1366, 1920].
        It will never generate any images larger than the source.
        `,
      },
      sizes: {
        type: GraphQLString,
        description: stripIndent`
        The "sizes" property, passed to the img tag. This describes the display size of the image.
        This does not affect the generated images, but is used by the browser to decide which images to download.
        You should usually leave this blank, and a suitable value will be calculated. The exception is if a FULL_WIDTH image
        does not actually span the full width of the screen, in which case you should pass the correct size here.
        `,
      },
      quality: {
        type: GraphQLInt,
        description: `The default quality. This is overridden by any format-specific options`,
      },
      jpgOptions: {
        type: JPGOptionsType,
        description: `Options to pass to sharp when generating JPG images.`,
      },
      pngOptions: {
        type: PNGOptionsType,
        description: `Options to pass to sharp when generating PNG images.`,
      },
      webpOptions: {
        type: WebPOptionsType,
        description: `Options to pass to sharp when generating WebP images.`,
      },
      avifOptions: {
        type: AVIFOptionsType,
        description: `Options to pass to sharp when generating AVIF images.`,
      },
      transformOptions: {
        type: TransformOptionsType,
        description: `Options to pass to sharp to control cropping and other image manipulations.`,
      },
      backgroundColor: {
        type: GraphQLString,
        description: `Background color applied to the wrapper. Also passed to sharp to use as a background when "letterboxing" an image to another aspect ratio.`,
      },
    },
    resolve: async (image, fieldArgs, context) => {
      const file = getNodeAndSavePathDependency(image.parent, context.path)

      if (!generateImageData) {
        reporter.warn(`Please upgrade gatsby-plugin-sharp`)
        return null
      }
      const imageData = await generateImageData({
        file,
        args: fieldArgs,
        pathPrefix,
        reporter,
        cache,
      })

      return imageData
    },
  }
}

/**
 * Keeps track of asynchronous file copy to prevent sequence errors in the
 * underlying fs-extra module during parallel copies of the same file
 */
const inProgressCopy = new Set()

const createFields = ({
  pathPrefix,
  getNodeAndSavePathDependency,
  reporter,
  cache,
}) => {
  const nodeOptions = {
    pathPrefix,
    getNodeAndSavePathDependency,
    reporter,
    cache,
  }

  const fixedNode = fixedNodeType({ name: `ImageSharpFixed`, ...nodeOptions })
  const fluidNode = fluidNodeType({ name: `ImageSharpFluid`, ...nodeOptions })
  const imageNode = imageNodeType(nodeOptions)

  return {
    fixed: fixedNode,
    fluid: fluidNode,
    gatsbyImageData: imageNode,
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
        const imageName = `${details.name}-${image.internal.contentDigest}${details.ext}`
        const publicPath = path.join(
          process.cwd(),
          `public`,
          `static`,
          imageName
        )

        if (!fs.existsSync(publicPath) && !inProgressCopy.has(publicPath)) {
          // keep track of in progress copy, we should rely on `existsSync` but
          // a race condition exists between the exists check and the copy
          inProgressCopy.add(publicPath)
          fs.copy(
            details.absolutePath,
            publicPath,
            { dereference: true },
            err => {
              // this is no longer in progress
              inProgressCopy.delete(publicPath)
              if (err) {
                reporter.panic(
                  {
                    id: prefixId(CODES.MissingResource),
                    context: {
                      sourceMessage: `error copying file from ${details.absolutePath} to ${publicPath}`,
                    },
                  },
                  err
                )
              }
            }
          )
        }

        return {
          width: dimensions.width,
          height: dimensions.height,
          src: `${pathPrefix}/static/${imageName}`,
        }
      },
    },
    resize: {
      type: new GraphQLObjectType({
        name: `ImageSharpResize`,
        fields: {
          src: { type: GraphQLString },
          tracedSVG: {
            type: GraphQLString,
            resolve: parent =>
              getTracedSVG({
                ...parent,
                cache,
                reporter,
              }),
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
        },
        height: {
          type: GraphQLInt,
        },
        quality: {
          type: GraphQLInt,
        },
        jpegQuality: {
          type: GraphQLInt,
        },
        pngQuality: {
          type: GraphQLInt,
        },
        webpQuality: {
          type: GraphQLInt,
        },
        jpegProgressive: {
          type: GraphQLBoolean,
          defaultValue: true,
        },
        pngCompressionLevel: {
          type: GraphQLInt,
          defaultValue: 9,
        },
        pngCompressionSpeed: {
          type: GraphQLInt,
          defaultValue: DEFAULT_PNG_COMPRESSION_SPEED,
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
        fit: {
          type: ImageFitType,
          defaultValue: sharp.fit.cover,
        },
        background: {
          type: GraphQLString,
          defaultValue: `rgba(0,0,0,1)`,
        },
        rotate: {
          type: GraphQLInt,
          defaultValue: 0,
        },
        trim: {
          type: GraphQLFloat,
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
                cache,
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

module.exports = ({
  actions,
  schema,
  pathPrefix,
  getNodeAndSavePathDependency,
  reporter,
  cache,
}) => {
  const { createTypes } = actions

  const imageSharpType = schema.buildObjectType({
    name: `ImageSharp`,
    fields: createFields({
      pathPrefix,
      getNodeAndSavePathDependency,
      reporter,
      cache,
    }),
    interfaces: [`Node`],
    extensions: {
      infer: true,
      childOf: {
        types: [`File`],
      },
    },
  })

  if (createTypes) {
    createTypes([
      ImageFormatType,
      ImageFitType,
      ImageLayoutType,
      ImageCropFocusType,
      DuotoneGradientType,
      PotraceTurnPolicyType,
      PotraceType,
      imageSharpType,
    ])
  }
}
