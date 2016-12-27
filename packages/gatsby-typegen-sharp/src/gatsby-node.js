const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
} = require(`graphql`)
const _ = require(`lodash`)

exports.extendNodeType = ({ args, pluginOptions }) => {
  const { ast, type } = args
  if (type.name !== `ImageSharp`) { return {} }

  // TODO Add fields
  return {
  }
}
