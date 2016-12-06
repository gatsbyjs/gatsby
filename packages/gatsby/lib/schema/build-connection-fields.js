const _ = require(`lodash`)
const {
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLEnumType,
} = require(`graphql`)

const { buildFieldEnumValues } = require(`./ast-utils`)

module.exports = (nodes, namespace=``) => {
  const enumValues = buildFieldEnumValues(nodes)
  return {
    totalCount: {
      type: GraphQLInt,
    },
    distinct: {
      type: new GraphQLList(GraphQLString),
      args: {
        field: {
          type: new GraphQLEnumType({
            name: _.camelCase(`${namespace} distinct enum`),
            values: enumValues,
          }),
        },
      },
      resolve (connection, args) {
        let fieldName = args.field
        if (_.includes(args.field, `___`)) {
          fieldName = args.field.replace(`___`, `.`)
        }
        const fields = connection.edges.map((edge) => _.get(edge.node, fieldName))
        return _.filter(_.uniq(_.flatten(fields)), _.identity)
      },
    },
  }
}
