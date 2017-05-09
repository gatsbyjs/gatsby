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

const inferGraphQLType = ({ value, selector, fieldName, ...otherArgs }) => {
  const newSelector = selector ? [selector, fieldName].join(`.`) : fieldName
  if (Array.isArray(value)) {
    const headValue = value[0]
    let headType
    // If the array contains objects, than treat them as "nodes"
    // and create an object type.
    if (_.isObject(headValue)) {
      headType = new GraphQLObjectType({
        name: createTypeName(fieldName),
        fields: inferObjectStructureFromNodes({
          ...otherArgs,
          selector: newSelector,
        }),
      })
      // Else if the values are simple values, just infer their type.
    } else {
      headType = inferGraphQLType({
        value: headValue,
        fieldName,
        ...otherArgs,
      }).type
    }
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
          name: createTypeName(fieldName),
          fields: inferObjectStructureFromNodes({
            ...otherArgs,
            selector: newSelector,
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
const inferObjectStructureFromNodes = (exports.inferObjectStructureFromNodes = ({
  nodes,
  selector,
  types,
  allNodes,
}) => {
  const fieldExamples = extractFieldExamples({ nodes, selector })

  // Remove fields common to the top-level of all nodes.  We add these
  // elsewhere so don't need to infer their type.
  if (!selector) {
    delete fieldExamples.type
    delete fieldExamples.id
    delete fieldExamples.parent
    delete fieldExamples.children
  }

  const config = store.getState().config
  let mapping
  if (config) {
    mapping = config.mapping
  }
  const inferredFields = {}
  _.each(fieldExamples, (v, k) => {
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
    const fieldSelector = _.remove([nodes[0].type, selector, k]).join(`.`)
    if (mapping && _.includes(Object.keys(mapping), fieldSelector)) {
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

      if (_.isArray(v)) {
        inferredFields[k] = {
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
      } else {
        inferredFields[k] = {
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
      // Check if the key ends with ___node.
    } else if (_.includes(k, `___NODE`)) {
      let value = v
      if (_.isArray(value)) {
        value = value[0]
      }

      const [fieldName, NODE, linkedField] = k.split(`___`)

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

      if (_.isArray(v)) {
        inferredFields[fieldName] = {
          type: new GraphQLList(field.nodeObjectType),
          resolve: (node, a, b) => {
            let fieldValue = node[k]

            if (fieldValue) {
              return fieldValue.map(value => findNode(value, b.path))
            } else {
              return null
            }
          },
        }
      } else {
        inferredFields[fieldName] = {
          type: field.nodeObjectType,
          resolve: (node, a, b) => {
            let fieldValue = node[k]

            if (fieldValue) {
              const result = findNode(fieldValue, b.path)
              return result
            } else {
              return null
            }
          },
        }
      }

      // Look for fields that are pointing at a file — if the field has a known
      // extension then assume it should be a file field.
      //
      // TODO probably should just check if the referenced file exists
      // only then turn this into a field field.
    } else if (
      nodes[0].type !== `File` &&
      _.isString(v) &&
      mime.lookup(v) !== `application/octet-stream` &&
      // domains ending with .com
      mime.lookup(v) !== `application/x-msdownload` &&
      isRelative(v) &&
      isRelativeUrl(v)
    ) {
      const fileNodes = types.filter(type => type.name === `File`)
      if (fileNodes && fileNodes.length > 0) {
        const fileField = types.find(type => type.name === `File`)
        inferredFields[k] = {
          type: fileField.nodeObjectType,
          resolve: (node, a, { path }) => {
            let fieldValue = node[k]

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
      // Else do our automatic inference from the data.
    } else {
      inferredFields[k] = inferGraphQLType({
        value: v,
        fieldName: k,
        selector,
        nodes,
        types,
        allNodes: getNodes(),
      })
    }
  })

  return inferredFields
})
