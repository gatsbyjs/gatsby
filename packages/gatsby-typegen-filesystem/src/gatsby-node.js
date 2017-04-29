const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
} = require(`graphql`)
const select = require(`unist-util-select`)
const path = require(`path`)

// TODO add support for exiftool fields here.

// exports.registerGraphQLNodes = ({ args }) => {
// const { ast } = args
// const nodes = select(ast, `File`)

// const fields = {
// urlPathname: {
// type: GraphQLString,
// description: `The relative path to this file converted to a sensible url pathname`,
// resolve (file) {
// const parsedPath = parsePath(file.relativePath)
// const { dirname } = parsedPath
// let { name } = parsedPath
// if (name === `template` || name === `index`) {
// name = ``
// }
// // TODO url encode pathname?
// return path.posix.join(`/`, dirname, name, `/`)
// },
// },
// }

// return [
// {
// type: `File`,
// name: `File`,
// fields,
// nodes,
// },
// ]
// }
