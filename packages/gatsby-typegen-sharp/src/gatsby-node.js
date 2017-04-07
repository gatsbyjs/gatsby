const {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
} = require("graphql");
const {
  queueImageResizing,
  base64,
  responsiveSizes,
  responsiveResolution,
} = require("gatsby-plugin-sharp");

exports.extendNodeType = ({ args }) => {
  if (args.type.name !== `ImageSharp`) {
    return {};
  }

  return {
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
        quality: {
          type: GraphQLInt,
          defaultValue: 50,
        },
      },
      resolve(image, fieldArgs) {
        const promise = responsiveResolution({
          file: image.parent,
          args: { ...fieldArgs, linkPrefix: args.linkPrefix },
        });
        return promise;
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
        quality: {
          type: GraphQLInt,
          defaultValue: 50,
        },
      },
      resolve(image, fieldArgs) {
        return responsiveSizes({
          file: image.parent,
          args: { ...fieldArgs, linkPrefix: args.linkPrefix },
        });
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
        base64: {
          type: GraphQLBoolean,
          defaultValue: false,
        },
      },
      resolve(image, fieldArgs) {
        return new Promise(resolve => {
          const file = image.parent;
          if (fieldArgs.base64) {
            resolve(
              base64({
                file,
              })
            );
          } else {
            resolve(
              queueImageResizing({
                file,
                args: { ...fieldArgs, linkPrefix: args.linkPrefix },
              })
            );
          }
        });
      },
    },
  };
};
