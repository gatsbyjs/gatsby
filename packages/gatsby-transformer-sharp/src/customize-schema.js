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
} = require(`./types`)
const { stripIndent } = require(`common-tags`)
const { prefixId, CODES } = require(`./error-utils`)

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
    type: new GraphQLObjectType({
      name: `ImageSharpGatsbyImage`,
      fields: {
        imageData: {
          type: new GraphQLNonNull(GraphQLJSON),
        },
      },
    }),
    args: {
      layout: {
        type: ImageLayoutType,
        defaultValue: `fixed`,
        description: stripIndent`
        The layout for the image.
        FIXED: A static image sized, that does not resize according to the screen width
        FLUID: The image resizes to fit its container. Pass a "sizes" option if it isn't going to be the full width of the screen. 
        CONSTRAINED: Resizes to fit its container, up to a maximum width, at which point it will remain fixed in size.
        `,
      },
      maxWidth: {
        type: GraphQLInt,
        description: stripIndent`
        Maximum display width of generated files. 
        The actual largest image resolution will be this value multipled by the largest value in outputPixelDensities
        This only applies when layout = FLUID or CONSTRAINED. For other layout types, use "width"`,
      },
      maxHeight: {
        type: GraphQLInt,
      },
      width: {
        type: GraphQLInt,
        description: stripIndent`
        The display width of the generated image. 
        The actual largest image resolution will be this value multipled by the largest value in outputPixelDensities
        Ignored if layout = FLUID or CONSTRAINED, where you should use "maxWidth" instead.
        `,
      },
      height: {
        type: GraphQLInt,
      },
      placeholder: {
        type: ImagePlaceholderType,
        defaultValue: `blurred`,
        description: stripIndent`
        Format of generated placeholder image. 
        DOMINANT_COLOR: a solid color, calculated from the dominant color of the image. 
        BASE64: a blurred, low resolution image, encoded as a base64 data URI
        TRACED_SVG: a low-resolution traced SVG of the image.
        NONE: no placeholder. Set "background" to use a fixed background color.`,
      },
      tracedSVGOptions: {
        type: PotraceType,
        defaultValue: false,
        description: `Options for traced placeholder SVGs. You also should set placeholder to SVG.`,
      },
      webP: {
        type: GraphQLBoolean,
        defaultValue: true,
        description: `Generate images in WebP format as well as matching the input format. This is the default (and strongly recommended), but will add to processing time.`,
      },
      outputPixelDensities: {
        type: GraphQLList(GraphQLFloat),
        description: stripIndent`
        A list of image pixel densities to generate, for high-resolution (retina) screens. It will never generate images larger than the source, and will always a 1x image. 
        Default is [ 1, 2 ] for fixed images, meaning 1x, 2x, 3x, and [0.25, 0.5, 1, 2] for fluid. In this case, an image with a fluid layout and width = 400 would generate images at 100, 200, 400 and 800px wide`,
      },
      sizes: {
        type: GraphQLString,
        defaultValue: ``,
        description: stripIndent`
        The "sizes" property, passed to the img tag. This describes the display size of the image. 
        This does not affect the generated images, but is used by the browser to decide which images to download. You can leave this blank for fixed images, or if the responsive image
        container will be the full width of the screen. In these cases we will generate an appropriate value.
        `,
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
        description: `Force output format. Default is to use the same as the input format`,
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
      srcSetBreakpoints: {
        type: GraphQLList(GraphQLInt),
        defaultValue: [],
        description: stripIndent`\
        A list of image widths to be generated. Example: [ 200, 340, 520, 890 ]. 
        You should usually leave this blank and allow it to be generated from the width/maxWidth and outputPixelDensities`,
      },
    },
    resolve: async (image, fieldArgs, context) => {
      const file = getNodeAndSavePathDependency(image.parent, context.path)
      const args = { ...fieldArgs, pathPrefix }

      if (!generateImageData) {
        reporter.warn(`Please upgrade gatsby-plugin-sharp`)
        return null
      }
      reporter.warn(
        stripIndent`
        You are using the alpha version of the \`gatsbyImage\` sharp API, which is unstable and will change without notice. 
        Please do not use it in production.`
      )
      const imageData = await generateImageData({
        file,
        args,
        reporter,
        cache,
      })

      return {
        imageData,
        fieldArgs: args,
        image,
        file,
      }
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

  // TODO: Remove resolutionsNode and sizesNode for Gatsby v3
  const fixedNode = fixedNodeType({ name: `ImageSharpFixed`, ...nodeOptions })
  const resolutionsNode = fixedNodeType({
    name: `ImageSharpResolutions`,
    ...nodeOptions,
  })
  resolutionsNode.deprecationReason = `Resolutions was deprecated in Gatsby v2. It's been renamed to "fixed" https://example.com/write-docs-and-fix-this-example-link`

  const fluidNode = fluidNodeType({ name: `ImageSharpFluid`, ...nodeOptions })
  const sizesNode = fluidNodeType({ name: `ImageSharpSizes`, ...nodeOptions })
  sizesNode.deprecationReason = `Sizes was deprecated in Gatsby v2. It's been renamed to "fluid" https://example.com/write-docs-and-fix-this-example-link`

  const imageNode = imageNodeType(nodeOptions)

  return {
    fixed: fixedNode,
    resolutions: resolutionsNode,
    fluid: fluidNode,
    sizes: sizesNode,
    gatsbyImage: imageNode,
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
          fs.copy(details.absolutePath, publicPath, err => {
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
          })
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
