const {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
} = require("graphql")
const _ = require("lodash")
const moment = require("moment")
const parseFilepath = require("parse-filepath")
const mime = require("mime")
const { siteDB } = require("../utils/globals")

const inferGraphQLType = ({ value, fieldName, ...otherArgs }) => {
  if (Array.isArray(value)) {
    const headType = inferGraphQLType({ value: value[0] }).type
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
        fromNow: {
          type: GraphQLBoolean,
          description: `Returns a string generated with Moment.js' fromNow function`,
        },
        difference: {
          type: GraphQLString,
          description: `Returns the difference between this date and the current time. Defaults to miliseconds but you can also pass in as the measurement years, months, weeks, days, hours, minutes, and seconds.`,
        },
      },
      resolve(object, { fromNow, difference, formatString }) {
        const date = object[fieldName]
        if (formatString) {
          return moment.utc(date, ISO_8601_FORMAT, true).format(formatString)
        } else if (fromNow) {
          return moment.utc(date, ISO_8601_FORMAT, true).fromNow()
        } else if (difference) {
          return moment().diff(
            moment.utc(date, ISO_8601_FORMAT, true),
            difference
          )
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
          name: _.camelCase(fieldName),
          fields: inferObjectStructureFromNodes({
            selector: fieldName,
            ...otherArgs,
          }),
        }),
      }
    case `number`:
      return value % 1 === 0 ? { type: GraphQLInt } : { type: GraphQLFloat }
    default:
      return null
  }
}

// Call this for the top level node + recursively for each sub-object.
// E.g. This gets called for Markdown and then for its frontmatter subobject.
const inferObjectStructureFromNodes = (exports.inferObjectStructureFromNodes = (
  {
    nodes,
    selector,
    types,
  }
) => {
  const type = nodes[0].type
  const fieldExamples = {}
  _.each(nodes, node => {
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

  // Add the "path" to each subnode as we'll need this later when resolving
  // mapped fields to types in GraphQL land. We do that here (after creating
  // field examples) so our special field is not added to the GraphQL type.
  if (selector) {
    nodes.forEach(node => {
      _.set(node, `${selector}.___path`, `${type}.${selector}`)
    })
  }

  // Remove fields common to the top-level of all nodes.  We add these
  // elsewhere so don't need to infer there type.
  if (!selector) {
    delete fieldExamples.type
    delete fieldExamples.id
    delete fieldExamples.parent
    delete fieldExamples.children
  }

  const config = siteDB().get(`config`)
  let mapping
  if (config) {
    mapping = config.mapping
  }
  const inferredFields = {}
  _.each(fieldExamples, (v, k) => {
    // Create fields for children.
    // TODO reconsider this?
    //if (k === `children`) {
    ////console.log(`children`, v)
    //_.each(v, (node) => {
    //const matchedTypes = _.filter(types, (type) => {
    //return type.type === node.type
    //})
    ////console.log(`matchedTypes for ${node.type}`, matchedTypes)
    //matchedTypes.forEach((matchedType) => {
    //inferredFields[_.camelCase(matchedType.name)] = matchedType.field
    //})
    //})
    //}
    // Check if field is pointing to custom type.
    // First check field => type mappings in gatsby-config.js
    const fieldSelector = `${nodes[0].type}.${selector}.${k}`
    if (mapping && _.includes(Object.keys(mapping), fieldSelector)) {
      const matchedTypes = types.filter(
        type => type.name === mapping[fieldSelector]
      )
      inferredFields[k] = matchedTypes[0].field
    } else if (_.includes(k, `___`)) {
      const fieldType = _.capitalize(k.split(`___`)[1])
      const matchedType = _.find(types, type => type.name === fieldType)
      if (matchedType) {
        inferredFields[k] = matchedType.field
      }

      // Special case fields that look like they're pointing at a file — if the
      // field has a known extension then assume it should be a file field.
    } else if (
      nodes[0].type !== `File` &&
      _.isString(v) &&
      mime.lookup(v) !== `application/octet-stream`
    ) {
      inferredFields[k] = types.filter(type => type.name === `File`)[0].field
    } else {
      inferredFields[k] = inferGraphQLType({
        value: v,
        fieldName: k,
        nodes,
        types,
      })
    }
  })

  return inferredFields
})
