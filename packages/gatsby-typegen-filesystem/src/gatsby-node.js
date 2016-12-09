const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
  GraphQLString,
  GraphQLInt,
} = require(`graphql`)
const select = require(`unist-util-select`)
const parsePath = require(`parse-filepath`)
const path = require(`path`)

exports.registerGraphQLNodes = ({ args }) => {
  const { ast } = args
  const nodes = select(ast, `File`)

  const fields = {
    urlPathname: {
      type: GraphQLString,
      description: `The relative path to this file converted to a sensible url pathname`,
      resolve (file) {
        const parsedPath = parsePath(file.relativePath)
        const { dirname } = parsedPath
        let { name } = parsedPath
        if (name === `template` || name === `index`) {
          name = ``
        }
        // TODO url encode pathname?
        return path.posix.join(`/`, dirname, name, `/`)
      },
    },
  }

  return [
    {
      type: `File`,
      name: `File`,
      fields,
      nodes,
    },
  ]
  /*
  const fileType = new GraphQLObjectType({
    name: `File`,
    fields: {
      ...inferredFields,
      ...nodeFields,
      ...customFields,
    },
    interfaces: [nodeInterface],
    isTypeOf: (value) => value.type === `File`,
  })

  const { connectionType: typeConnection } =
    connectionDefinitions(
      {
        nodeType: fileType,
        connectionFields: () => ({
          totalCount: {
            type: GraphQLInt,
          },
        }),
      }
    )

  const types = {
    file: {
      type: fileType,
      args: {
        ...inferredFields,
      },
      resolve (arg, inputArgs) {
        return _.find(nodes, (file) => (
          // Check if any of input args don't match the file's value.
          // If they don't match, return false so we go onto the next file.
          !_.some(inputArgs, (v, k) => file[k] !== v)
        ))
      },
    },
    allFile: {
      type: typeConnection,
      description: `Connection to all file nodes`,
      args: {
        ...connectionArgs,
      },
      resolve (object, resolveArgs) {
        const result = connectionFromArray(
          nodes,
          resolveArgs,
        )
        result.totalCount = nodes.length
        return result
      },
    },
  }

  return types
  */
}
