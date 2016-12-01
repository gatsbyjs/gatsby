const {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
} = require(`graphql`)
const _ = require(`lodash`)
const moment = require(`moment`)

const inferGraphQLType = exports.inferGraphQLType = (value, key, nodes) => {
  if (Array.isArray(value)) {
    const headType = inferGraphQLType(value[0]).type
    return { type: new GraphQLList(headType) }
  }

  if (value === null) {
    return null
  }

  // Check if this is a date.
  // All the allowed ISO 8601 date-time formats used.
  const ISO_8601_FORMAT = [
    `YYYY`,
    `YYYY-MM`,
    `YYYY-MM-DD`,
    `YYYYMMDD`,
    `YYYY-MM-DDTHHZ`,
    `YYYY-MM-DDTHH:mmZ`,
    `YYYY-MM-DDTHHmmZ`,
    `YYYY-MM-DDTHH:mm:ssZ`,
    `YYYY-MM-DDTHHmmssZ`,
    `YYYY-MM-DDTHH:mm:ss.SSSZ`,
    `YYYY-MM-DDTHHmmss.SSSZ`,
    `YYYY-[W]WW`,
    `YYYY[W]WW`,
    `YYYY-[W]WW-E`,
    `YYYY[W]WWE`,
    `YYYY-DDDD`,
    `YYYYDDDD`,
  ]
  const momentDate = moment.utc(value, ISO_8601_FORMAT, true)
  if (momentDate.isValid()) {
    return {
      type: GraphQLString,
      args: {
        formatString: {
          type: GraphQLString,
        },
      },
      resolve ({ date }, { formatString }) {
        if (formatString) {
          return moment.utc(date, ISO_8601_FORMAT, true).format(formatString)
        } else {
          return date
        }
      },
    }
  }

  switch (typeof value) {
    case `boolean`:
      return { type: GraphQLBoolean }
    case `string`:
      return { type: GraphQLString }
    case `object`:
      return {
        type: new GraphQLObjectType({
          name: _.camelCase(key),
          fields: inferObjectStructureFromNodes(nodes, key),
        }),
      }
    case `number`:
      return value % 1 === 0
        ? { type: GraphQLInt }
        : { type: GraphQLFloat }
    default:
      return null
  }
}

const inferObjectStructureFromNodes = exports.inferObjectStructureFromNodes = (nodes, selector) => {
  const fieldExamples = {}
  _.each(nodes, (node) => {
    let subNode
    if (selector) {
      subNode = _.get(node, selector)
    } else {
      subNode = node
    }
    _.each(subNode, (v, k) => {
      if (!fieldExamples[k]) {
        fieldExamples[k] = v
      }
    })
  })

  // Remove fields common to all nodes.
  delete fieldExamples.type
  delete fieldExamples.id
  delete fieldExamples.children
  delete fieldExamples.parent

  //console.log(`fieldExamples`, fieldExamples, selector)

  const inferredFields = {}
  _.each(fieldExamples, (v, k) => {
    inferredFields[k] = inferGraphQLType(v, k, nodes)
  })

  return inferredFields
}
