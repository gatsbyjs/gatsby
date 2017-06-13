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
const invariant = require(`invariant`)
const moment = require(`moment`)
const mime = require(`mime`)
const isRelative = require(`is-relative`)
const isRelativeUrl = require(`is-relative-url`)
const normalize = require(`normalize-path`)
const systemPath = require(`path`)
const { oneLine } = require(`common-tags`)

const { store, getNode, getNodes } = require(`../redux`)
const { joinPath } = require(`../utils/path`)
const { createPageDependency } = require(`../redux/actions/add-page-dependency`)
const createTypeName = require(`./create-type-name`)
const createKey = require(`./create-key`)
const {
  extractFieldExamples,
  isEmptyObjectOrArray,
} = require(`./data-tree-utils`)

import type { GraphQLOutputType } from "graphql"
import type {
  GraphQLFieldConfig,
  GraphQLFieldConfigMap,
} from "graphql/type/definition"

export type ProcessedNodeType = {
  name: string,
  nodes: any[],
  node: GraphQLFieldConfig<*, *>,
  fieldsFromPlugins: any,
  nodeObjectType: GraphQLOutputType,
}

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

function inferGraphQLType({
  exampleValue,
  selector,
  ...otherArgs
}): ?GraphQLFieldConfig<*, *> {
  if (exampleValue == null || isEmptyObjectOrArray(exampleValue)) return
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
      let inferredType = inferGraphQLType({
        ...otherArgs,
        exampleValue,
        selector,
      })
      invariant(
        inferredType,
        `Could not infer graphQL type for value: ${exampleValue}`
      )

      headType = inferredType.type
    }
    return { type: new GraphQLList(headType) }
  }

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
          description: oneLine`
            Returns a string generated with Moment.js' fromNow function`,
        },
        difference: {
          type: GraphQLString,
          description: oneLine`
            Returns the difference between this date and the current time.
            Defaults to miliseconds but you can also pass in as the
            measurement years, months, weeks, days, hours, minutes,
            and seconds.`,
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

function inferFromMapping(
  value,
  mapping,
  fieldSelector,
  types
): ?GraphQLFieldConfig<*, *> {
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
      n => n.internal.type === linkedType && n.id === fieldValue
    )
    if (linkedNode) {
      createPageDependency({ path, nodeId: linkedNode.id })
      return linkedNode
    }
  }

  if (_.isArray(value)) {
    return {
      type: new GraphQLList(matchedTypes[0].nodeObjectType),
      resolve: (node, a, b, { fieldName }) => {
        const fieldValue = node[fieldName]

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
      const fieldValue = node[fieldName]

      if (fieldValue) {
        return findNode(fieldValue, b.path)
      } else {
        return null
      }
    },
  }
}

function findLinkedNode(value, linkedField, path) {
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
      createPageDependency({ path, nodeId: linkedNode.id })
    }
    return linkedNode
  }
}

function inferFromFieldName(value, selector, types): GraphQLFieldConfig<*, *> {
  let isArray = false
  if (_.isArray(value)) {
    value = value[0]
    isArray = true
  }
  const key = selector.split(`.`).pop()
  const [, , linkedField] = key.split(`___`)

  const linkedNode = findLinkedNode(value, linkedField)
  invariant(
    linkedNode,
    oneLine`
      Encountered an error trying to infer a GraphQL type for: "${selector}".
      There is no corresponding node with the ${linkedField || `id`}
      field matching: "${value}"
    `
  )
  const field = types.find(type => type.name === linkedNode.internal.type)

  invariant(
    field,
    oneLine`
      Encountered an error trying to infer a GraphQL type for: "${selector}".
      There is no corresponding GraphQL type "${linkedNode.internal
        .type}" available
      to link to this node.
    `
  )

  if (isArray) {
    return {
      type: new GraphQLList(field.nodeObjectType),
      resolve: (node, a, b = {}) => {
        let fieldValue = node[key]
        if (fieldValue) {
          return fieldValue.map(value =>
            findLinkedNode(value, linkedField, b.path)
          )
        } else {
          return null
        }
      },
    }
  }

  return {
    type: field.nodeObjectType,
    resolve: (node, a, b = {}) => {
      let fieldValue = node[key]
      if (fieldValue) {
        const result = findLinkedNode(fieldValue, linkedField, b.path)
        return result
      } else {
        return null
      }
    },
  }
}

function findRootNode(node) {
  // Find the root node.
  let rootNode = node
  let whileCount = 0
  while (
    rootNode.parent &&
    getNode(rootNode.parent) !== undefined &&
    whileCount < 101
  ) {
    rootNode = getNode(rootNode.parent)
    whileCount += 1
    if (whileCount > 100) {
      console.log(
        `It looks like you have a node that's set its parent as itself`,
        rootNode
      )
    }
  }

  return rootNode
}

function shouldInferFile(nodes, key, value) {
  // Find the node used for this example.
  const node = nodes.find(n => _.get(n, key) === value)

  if (!node) {
    return false
  }

  const looksLikeFile =
    _.isString(value) &&
    mime.lookup(value) !== `application/octet-stream` &&
    // domains ending with .com
    mime.lookup(value) !== `application/x-msdownload` &&
    isRelative(value) &&
    isRelativeUrl(value)

  if (!looksLikeFile) {
    return false
  }

  const rootNode = findRootNode(node)

  // Only nodes transformed (ultimately) from a File
  // can link to another File.
  if (rootNode.internal.type !== `File`) {
    return false
  }

  const pathToOtherNode = normalize(joinPath(rootNode.dir, value))
  console.log(`pathToOtherNode`, pathToOtherNode)
  if (_.endsWith(pathToOtherNode, `jpg`)) {
    console.log(
      _.filter(getNodes(), node => node.internal.type === `File`).map(
        n => n.absolutePath
      )
    )
  }
  const otherFileExists = getNodes().some(
    n => n.absolutePath === pathToOtherNode
  )
  console.log(`otherFileExists`, otherFileExists)
  return otherFileExists
}

// Look for fields that are pointing at a file — if the field has a known
// extension then assume it should be a file field.
function inferFromUri(key, types) {
  const fileField = types.find(type => type.name === `File`)

  if (!fileField) return

  return {
    type: fileField.nodeObjectType,
    resolve: (node, a, { path }) => {
      const fieldValue = node[key]

      if (!fieldValue) {
        return null
      }

      // Find File node for this node (we assume the node is something
      // like markdown which would be a child node of a File node).
      const parentFileNode = findRootNode(node)

      // Use the parent File node to create the absolute path to
      // the linked file.
      const fileLinkPath = normalize(
        systemPath.resolve(parentFileNode.dir, fieldValue)
      )

      console.log(``)
      console.log(`path`, path)
      console.log(`fieldValue`, fieldValue)
      console.log(`fileLinkPath`, fileLinkPath)
      // console.log(
      // _.filter(getNodes(), node => node.internal.type === `File`).map(
      // n => n.absolutePath
      // )
      // )

      // Use that path to find the linked File node.
      const linkedFileNode = _.find(
        getNodes(),
        n => n.internal.type === `File` && n.absolutePath === fileLinkPath
      )

      console.log(
        `linkedFileNode`,
        linkedFileNode
          ? { id: linkedFileNode.id, type: linkedFileNode.internal.type }
          : `no linkedFileNode`
      )

      if (linkedFileNode) {
        createPageDependency({
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

type inferTypeOptions = {
  nodes: Object[],
  types: ProcessedNodeType[],
  selector?: string,
  exampleValue?: Object,
}

const EXCLUDE_KEYS = {
  id: 1,
  parent: 1,
  children: 1,
}

// Call this for the top level node + recursively for each sub-object.
// E.g. This gets called for Markdown and then for its frontmatter subobject.
export function inferObjectStructureFromNodes({
  nodes,
  types,
  selector,
  exampleValue = extractFieldExamples(nodes),
}: inferTypeOptions): GraphQLFieldConfigMap<*, *> {
  const config = store.getState().config
  const isRoot = !selector
  const mapping = config && config.mapping

  // Ensure nodes have internal key with object.
  nodes = nodes.map(n => (n.internal ? n : { ...n, internal: {} }))

  const inferredFields = {}
  _.each(exampleValue, (value, key) => {
    // Remove fields common to the top-level of all nodes.  We add these
    // elsewhere so don't need to infer their type.
    if (isRoot && EXCLUDE_KEYS[key]) return

    // Several checks to see if a field is pointing to custom type
    // before we try automatic inference.
    const nextSelector = selector ? `${selector}.${key}` : key
    const fieldSelector = `${nodes[0].internal.type}.${nextSelector}`

    let fieldName = key
    let inferredField

    // First check for manual field => type mappings in the site's
    // gatsby-config.js
    if (mapping && _.includes(Object.keys(mapping), fieldSelector)) {
      inferredField = inferFromMapping(value, mapping, fieldSelector, types)

      // Second if the field has a suffix of ___node. We use then the value
      // (a node id) to find the node and use that node's type as the field
    } else if (_.includes(key, `___NODE`)) {
      ;[fieldName] = key.split(`___`)
      inferredField = inferFromFieldName(value, nextSelector, types)

      // Third if the field is pointing to a file (from another file).
    } else if (
      nodes[0].internal.type !== `File` &&
      shouldInferFile(nodes, nextSelector, value)
    ) {
      inferredField = inferFromUri(key, types)

      // Finally our automatic inference of field value type.
    } else {
      inferredField = inferGraphQLType({
        nodes,
        types,
        exampleValue: value,
        selector: selector ? `${selector}.${key}` : key,
      })
    }

    if (!inferredField) return

    // Replace unsupported values
    inferredFields[createKey(fieldName)] = inferredField
  })

  return inferredFields
}
