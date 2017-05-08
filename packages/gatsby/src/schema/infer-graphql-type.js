// @flow
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
const mime = require(`mime`)
const isRelative = require(`is-relative`)
const isRelativeUrl = require(`is-relative-url`)
const slash = require(`slash`)
const nodePath = require(`path`)

const { store, getNode, getNodes } = require(`../redux`)
const { addPageDependency } = require(`../redux/actions/add-page-dependency`)
const { extractFieldExamples } = require(`./data-tree-utils`)
const createTypeName = require(`./create-type-name`)

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

const inferGraphQLType = ({ exampleValue, selector, ...otherArgs }) => {
  let fieldName = selector.split(`.`).pop()

  if (Array.isArray(exampleValue)) {
    exampleValue = exampleValue[0]

    if (exampleValue == null) return

    let headType
    // If the array contains objects, than treat them as "nodes"
    // and create an object type.
    if (_.isObject(exampleValue)) {
      headType = new GraphQLObjectType({
        name: createTypeName(fieldName),
        fields: inferObjectStructureFromNodes({
          ...otherArgs,
          exampleValue,
          selector,
        }),
      })
      // Else if the values are simple values, just infer their type.
    } else {
      headType = inferGraphQLType({
        ...otherArgs,
        exampleValue,
        selector,
      }).type
    }
    return { type: new GraphQLList(headType) }
  }

  if (exampleValue == null) return

  // Check if this is a date.
  // All the allowed ISO 8601 date-time formats used.
  const momentDate = moment.utc(exampleValue, ISO_8601_FORMAT, true)
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

  switch (typeof exampleValue) {
    case `boolean`:
      return { type: GraphQLBoolean }
    case `string`:
      return { type: GraphQLString }
    case `object`:
      return {
        type: new GraphQLObjectType({
          name: createTypeName(fieldName),
          fields: inferObjectStructureFromNodes({
            ...otherArgs,
            exampleValue,
            selector,
          }),
        }),
      }
    case `number`:
      return _.isInteger(exampleValue)
        ? { type: GraphQLInt }
        : { type: GraphQLFloat }
    default:
      return null
  }
}

function inferFromMapping(value, mapping, fieldSelector, types) {
  const matchedTypes = types.filter(
    type => type.name === mapping[fieldSelector]
  )
  if (_.isEmpty(matchedTypes)) {
    console.log(`Couldn't find a matching node type for "${fieldSelector}"`)
    return
  }

  const findNode = (fieldValue, path) => {
    const linkedType = mapping[fieldSelector]
    const linkedNode = _.find(
      getNodes(),
      n => n.type === linkedType && n.id === fieldValue
    )
    if (linkedNode) {
      addPageDependency({ path, nodeId: linkedNode.id })
      return linkedNode
    }
  }

  if (_.isArray(value)) {
    return {
      type: new GraphQLList(matchedTypes[0].nodeObjectType),
      resolve: (node, a, b, { fieldName }) => {
        let fieldValue = node[fieldName]

        if (fieldValue) {
          return fieldValue.map(value => findNode(value, b.path))
        } else {
          return null
        }
      },
    }
  }

  return {
    type: matchedTypes[0].nodeObjectType,
    resolve: (node, a, b, { fieldName }) => {
      let fieldValue = node[fieldName]

      if (fieldValue) {
        return findNode(fieldValue, b.path)
      } else {
        return null
      }
    },
  }
}

function inferFromFieldName(value, key, types) {
  let isArray = false
  if (_.isArray(value)) {
    value = value[0]
    isArray = true
  }

  const [, , linkedField] = key.split(`___`)

  const findNode = (value, path) => {
    let linkedNode
    // If the field doesn't link to the id, use that for searching.
    if (linkedField) {
      linkedNode = getNodes().find(n => n[linkedField] === value)
      // Else the field is linking to the node's id, the default.
    } else {
      linkedNode = getNode(value)
    }

    if (linkedNode) {
      if (path) {
        addPageDependency({ path, nodeId: linkedNode.id })
      }
      return linkedNode
    }
  }

  const linkedNode = findNode(value)
  const field = types.find(type => type.name === linkedNode.type)

  if (isArray) {
    return {
      type: new GraphQLList(field.nodeObjectType),
      resolve: (node, a, b) => {
        let fieldValue = node[key]

        if (fieldValue) {
          return fieldValue.map(value => findNode(value, b.path))
        } else {
          return null
        }
      },
    }
  }

  return {
    type: field.nodeObjectType,
    resolve: (node, a, b) => {
      let fieldValue = node[key]

      if (fieldValue) {
        const result = findNode(fieldValue, b.path)
        return result
      } else {
        return null
      }
    },
  }
}

function shouldInferFile(value) {
  return (
    _.isString(value) &&
    mime.lookup(value) !== `application/octet-stream` &&
    // domains ending with .com
    mime.lookup(value) !== `application/x-msdownload` &&
    isRelative(value) &&
    isRelativeUrl(value)
  )
}

// Look for fields that are pointing at a file — if the field has a known
// extension then assume it should be a file field.
//
// TODO probably should just check if the referenced file exists
// only then turn this into a field field.
function inferFromUri(key, types) {
  const fileField = types.find(type => type.name === `File`)

  if (!fileField) return

  return {
    type: fileField.nodeObjectType,
    resolve: (node, a, { path }) => {
      let fieldValue = node[key]

      // Find File node for this node (we assume the node is something
      // like markdown which would be a child node of a File node).
      const parentFileNode = _.find(
        getNodes(),
        n => n.type === `File` && n.id === node.parent
      )

      // Use the parent File node to create the absolute path to
      // the linked file.
      const fileLinkPath = slash(
        nodePath.resolve(parentFileNode.dir, fieldValue)
      )

      // Use that path to find the linked File node.
      const linkedFileNode = _.find(
        getNodes(),
        n => n.type === `File` && n.absolutePath === fileLinkPath
      )

      if (linkedFileNode) {
        addPageDependency({
          path,
          nodeId: linkedFileNode.id,
        })
        return linkedFileNode
      } else {
        return null
      }
    },
  }
}

// Call this for the top level node + recursively for each sub-object.
// E.g. This gets called for Markdown and then for its frontmatter subobject.
const inferObjectStructureFromNodes = (exports.inferObjectStructureFromNodes = ({
  nodes,
  types,
  selector,
  exampleValue = extractFieldExamples({ nodes }),
}) => {
  // Remove fields common to the top-level of all nodes.  We add these
  // elsewhere so don't need to infer their type.
  if (!selector) {
    delete exampleValue.type
    delete exampleValue.id
    delete exampleValue.parent
    delete exampleValue.children
  }

  const config = store.getState().config
  let mapping
  if (config) {
    mapping = config.mapping
  }
  const inferredFields = {}
  _.each(exampleValue, (value, key) => {
    // Several checks to see if a field is pointing to custom type
    // before we try automatic inference.
    //
    // First check for manual field => type mappings in the site's
    // gatsby-config.js
    //
    // Second if the field has a suffix of ___node. We use then the value
    // (a node id) to find the node and use that node's type as the field.
    //
    // Third if the field is pointing to a file
    //
    // Finally our automatic inference of field value type.
    const nextSelector = selector ? `${selector}.${key}` : key
    const fieldSelector = `${nodes[0].type}.${nextSelector}`

    let fieldName = key
    let inferredField

    if (mapping && _.includes(Object.keys(mapping), fieldSelector)) {
      inferredField = inferFromMapping(value, mapping, fieldSelector, types)
    } else if (_.includes(key, `___NODE`)) {
      ;[fieldName] = key.split(`___`)
      inferredField = inferFromFieldName(value, key, types)
    } else if (nodes[0].type !== `File` && shouldInferFile(value)) {
      inferredField = inferFromUri(key, types)

      // Else do our automatic inference from the data.
    } else {
      inferredField = inferGraphQLType({
        nodes,
        types,
        exampleValue: value,
        selector: selector ? `${selector}.${key}` : key,
      })
    }

    if (inferredField) inferredFields[fieldName] = inferredField
  })

  return inferredFields
})
