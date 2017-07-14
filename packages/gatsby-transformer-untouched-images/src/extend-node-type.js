const Promise = require(`bluebird`)
const path = require('path');


const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLEnumType,
} = require(`graphql`)

const {promisify} = require('util');
const ncp = require('ncp');
const ncpAsync = promisify(ncp);

module.exports = ({ type, pathPrefix, getNodeAndSavePathDependency }) => {
  if (type.name !== `ImageUntouched`) {
    return {}
  }

  return {
    original: {
      type: new GraphQLObjectType({
        name: `ImageUntouchedOriginal`,
        fields: {
          src: { type: GraphQLString },
        },
      }),
      args: {
      },
      async resolve(image, fieldArgs, context) {
        const details = getNodeAndSavePathDependency(image.parent, context.path);

        const imageName = `${image.internal.contentDigest}.${details.ext}`;
        const publicPath = path.join(
          process.cwd(),
          `public`,
          `static/${imageName}`
        );

        await ncpAsync(details.absolutePath, publicPath);

        return {
          src: '/static/' + imageName,
        }
      },
    },
  }
}

