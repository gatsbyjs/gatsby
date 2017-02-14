const _ = require(`lodash`)
const {
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLEnumType,
} = require(`graphql`)
const {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
} = require(`graphql-skip-limit`)

const { buildFieldEnumValues } = require(`./ast-utils`)

module.exports = type => {
  //nodes, nodeType) => {
  const enumValues = buildFieldEnumValues(type.nodes)
  const { connectionType: groupConnection } = connectionDefinitions({
    name: _.camelCase(`${type.name} groupConnection`),
    nodeType: type.nodeObjectType,
    connectionFields: () => ({
      field: { type: GraphQLString },
      fieldValue: { type: GraphQLString },
      totalCount: { type: GraphQLInt },
    }),
  })

  return {
    totalCount: {
      type: GraphQLInt,
    },
    distinct: {
      type: new GraphQLList(GraphQLString),
      args: {
        field: {
          type: new GraphQLEnumType({
            name: _.camelCase(`${type.name} distinct enum`),
            values: enumValues,
          }),
        },
      },
      resolve (connection, args) {
        let fieldName = args.field
        if (_.includes(args.field, `___`)) {
          fieldName = args.field.replace(`___`, `.`)
        }
        const fields = connection.edges.map(edge =>
          _.get(edge.node, fieldName))
        return _.sortBy(_.filter(_.uniq(_.flatten(fields)), _.identity))
      },
    },
    groupBy: {
      type: new GraphQLList(groupConnection),
      args: {
        ...connectionArgs,
        field: {
          type: new GraphQLEnumType({
            name: _.camelCase(`${type.name} groupBy enum`),
            values: enumValues,
          }),
        },
      },
      resolve (connection, args) {
        const fieldName = args.field.replace(`___`, `.`)
        const connectionNodes = connection.edges.map(edge => edge.node)

        let groups = {}
        // Do a custom groupBy for arrays (w/ a group per array value)
        // Find the first node with this field and check if it's an array.
        if (_.isArray(_.get(_.find(connectionNodes, fieldName), fieldName))) {
          const values = _.uniq(
            _.reduce(
              connectionNodes,
              (vals, n) => {
                if (_.has(n, fieldName)) {
                  return vals.concat(_.get(n, fieldName))
                } else {
                  return vals
                }
              },
              [],
            ),
          )
          values.forEach(val => {
            groups[val] = _.filter(connectionNodes, n =>
              _.includes(_.get(n, fieldName), val))
          })
        } else {
          groups = _.groupBy(connectionNodes, fieldName)
        }
        const groupConnections = []

        // Do default sort by fieldValue
        const sortedFieldValues = _.sortBy(_.keys(groups))
        _.each(sortedFieldValues, fieldValue => {
          const groupNodes = groups[fieldValue]
          const groupConn = connectionFromArray(groupNodes, args)
          groupConn.totalCount = groupNodes.length
          groupConn.field = fieldName
          groupConn.fieldValue = fieldValue
          groupConnections.push(groupConn)
        })

        return groupConnections
      },
    },
  }
}
