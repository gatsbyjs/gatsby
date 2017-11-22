/* @flow */
const _ = require(`lodash`)
const { GraphQLSchema, GraphQLObjectType, GraphQLUnionType, GraphQLList } = require(`graphql`)

const buildNodeTypes = require(`./build-node-types`)
const buildNodeConnections = require(`./build-node-connections`)
const { store, getNodes } = require(`../redux`)
const invariant = require(`invariant`)

/**
 * The GraphQL definition of our shape union type
 */
const defineShapesType = (CircleGql, SquareGql) => (
  new GraphQLUnionType({
    name: `AllShapesType`,
    description: `All shapes under one roof`,
    types: [ CircleGql, SquareGql ],
    resolveType: (data) => {
      const { type } = data.internal
      switch (type) {
        case `ContentfulCircle`:
          return CircleGql
        case `ContentfulSquare`:
          return SquareGql
        default:
          return null
      }
    },
  })
)

/**
 * TODO:
 * TODO: resolve
 * TODO: args
 */
const genExtra = (CircleGql, SquareGql) => {
  return {
    allShapes: {
      type: new GraphQLList(defineShapesType(CircleGql, SquareGql)),
      args: {},
      resolve(root, args) {
        const latestNodes = _.filter(
          getNodes(),
          n => (n.internal.type === `ContentfulCircle`) ||
                (n.internal.type === `ContentfulSquare`)
        )
        return latestNodes
      },
    },
  }
}

module.exports = async () => {
  const typesGQL = await buildNodeTypes()
  const connections = buildNodeConnections(_.values(typesGQL))


  // Pull off just the graphql node from each type object.
  const nodes = _.mapValues(typesGQL, `node`)

  invariant(!_.isEmpty(nodes), `There are no available GQL nodes`)
  invariant(!_.isEmpty(connections), `There are no available GQL connections`)

  const CircleType = typesGQL[`contentfulCircle`].nodeObjectType
  const SqaureType = typesGQL[`contentfulSquare`].nodeObjectType
  const extra = genExtra(CircleType, SqaureType)

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: { ...connections, ...nodes, ...extra },
    }),
  })

  store.dispatch({
    type: `SET_SCHEMA`,
    payload: schema,
  })
}
