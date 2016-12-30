const {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
} = require(`graphql`)
const _ = require(`lodash`)
const processImage = require(`../gatsby-sharp`)

exports.extendNodeType = (options) => {
  if (options.args.type.name !== `ImageSharp`) { return {} }

  return {
    resize: {
      type: new GraphQLObjectType({
        name: `ImageSrc`,
        fields: {
          src: { type: GraphQLString },
          width: { type: GraphQLInt },
          height: { type: GraphQLInt },
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
        jpegQuality: {
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
        base64: {
          type: GraphQLBoolean,
          defaultValue: false,
        },
      },
      resolve (image, args) {
        return new Promise((resolve) => {
          const file = image.parent
          resolve(processImage({
            file,
            args,
          }))
        })
      },
    },
  }
}
