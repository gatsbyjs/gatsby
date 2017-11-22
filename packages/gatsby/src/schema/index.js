/* @flow */
const _ = require(`lodash`)
const { GraphQLSchema, GraphQLObjectType, GraphQLUnionType, GraphQLString, GraphQLNonNull, GraphQLList } = require(`graphql`)

const buildNodeTypes = require(`./build-node-types`)
const buildNodeConnections = require(`./build-node-connections`)
const { store, getNodes } = require(`../redux`)
const invariant = require(`invariant`)

const DATA = [
  { username : `catherine` },
  { director : `catherine hardwicke` },
  { author : `catherine cookson` },
]

const UserType = new GraphQLObjectType({
  name : `User`,
  fields : {
    username : { type : GraphQLString },
  },
})

const MovieType = new GraphQLObjectType({
  name : `Movie`,
  fields : {
    director : { type : GraphQLString },
  },
})

const BookType = new GraphQLObjectType({
  name : `Book`,
  fields : {
    author : { type : GraphQLString },
  },
})

const resolveType = (data) => {
  if (data.username) {
    return UserType
  }
  if (data.director) {
    return MovieType
  }
  if (data.author) {
    return BookType
  }
  return null
}

const SearchableType = new GraphQLUnionType({
  name: `SearchableType`,
  types: [ UserType, MovieType, BookType ],
  resolveType: resolveType,
})

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

// const latestNodes = _.filter(
//   getNodes(),
//   n => n.internal.type === `ContentfulCircle`
// )
//
// console.log(JSON.stringify(latestNodes, null, 2))

/**
 * TODO: get the gql for the Square
 * TODO: get the gql for the Circle
 * TODO: resolve type
 * TODO: resolve
 * TODO: args
 *
 * TODO add a circle and sqaure to the results
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
    search: {
      type: new GraphQLList(SearchableType),
      args:  {
        text: { type : new GraphQLNonNull(GraphQLString) },
      },
      resolve(root, args) {
        const text = args.text
        return DATA.filter((d) => {
          const searchableProperty = d.username || d.director || d.author
          return searchableProperty.indexOf(text) !== -1
        })
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
