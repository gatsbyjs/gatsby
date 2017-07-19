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
  responsiveSizes,
  responsiveResolution,
} = require(`gatsby-plugin-sharp`)

const sharp = require(`sharp`)
const promisify = require('util.promisify');
const fsExtra = require('fs-extra');
const sizeOf = require('image-size');
const path = require('path');

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
    }
  },
})

module.exports = ({ type, pathPrefix, getNodeAndSavePathDependency }) => {
  if (type.name !== `ImageSharp`) {
    return {}
  }

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
      args: {
      },
      async resolve(image, fieldArgs, context) {
        const details = getNodeAndSavePathDependency(image.parent, context.path);
        const dimensions = sizeOf(details.absolutePath);
        const imageName = `${image.internal.contentDigest}${details.ext}`;
        const publicPath = path.join(
          process.cwd(),
          `public`,
          `static/${imageName}`
        );

        if (!fsExtra.existsSync(publicPath)) {
          fsExtra.copy(details.absolutePath, publicPath, err => {
            if (err) {
              console.error(`error copying file`, err)
            }
          })
        }

        return {
          width: dimensions.width,
          height: dimensions.height,
          src: '/static/' + imageName,
        }
      },
    },
    responsiveResolution: {
      type: new GraphQLObjectType({
        name: `ImageSharpResponsiveResolution`,
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
      resolve(image, fieldArgs, context) {
        const promise = responsiveResolution({
          file: getNodeAndSavePathDependency(image.parent, context.path),
          args: { ...fieldArgs, pathPrefix },
        })
        return promise
      },
    },
    responsiveSizes: {
      type: new GraphQLObjectType({
        name: `ImageSharpResponsiveSizes`,
        fields: {
          base64: { type: GraphQLString },
          aspectRatio: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString },
          sizes: { type: GraphQLString },
          originalImg: { type: GraphQLString },
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
      resolve(image, fieldArgs, context) {
        return responsiveSizes({
          file: getNodeAndSavePathDependency(image.parent, context.path),
          args: { ...fieldArgs, pathPrefix },
        })
      },
    },
    resize: {
      type: new GraphQLObjectType({
        name: `ImageSharpResize`,
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
      resolve(image, fieldArgs, context) {
        return new Promise(resolve => {
          const file = getNodeAndSavePathDependency(image.parent, context.path)
          if (fieldArgs.base64) {
            resolve(
              base64({
                file,
              })
            )
          } else {
            resolve(
              queueImageResizing({
                file,
                args: { ...fieldArgs, pathPrefix },
              })
            )
          }
        })
      },
    },
  }
}
