const { GraphQLList } = require(`graphql`)
const _ = require(`lodash`)
const mime = require(`mime`)
const isRelative = require(`is-relative`)
const isRelativeUrl = require(`is-relative-url`)
const normalize = require(`normalize-path`)
const systemPath = require(`path`)

const { getNodes } = require(`../../redux`)
const {
  findRootNode,
  getValuesFromPath,
  registerTrackedPath,
} = require(`../node-tracking`)
const {
  createPageDependency,
} = require(`../../redux/actions/add-page-dependency`)
const { joinPath } = require(`../../utils/path`)

let type, listType

export function setFileNodeRootType(fileNodeRootType) {
  if (fileNodeRootType) {
    type = createType(fileNodeRootType, false)
    listType = createType(fileNodeRootType, true)
  } else {
    type = null
    listType = null
  }
}

function pointsToFile(nodes, key, value) {
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

  // Find the node used for this example.
  let node = nodes.find(
    node => getValuesFromPath(node, key).indexOf(value) !== -1
  )

  if (!node) {
    return false
  }

  const rootNode = findRootNode(node)

  // Only nodes transformed (ultimately) from a File
  // can link to another File.
  if (rootNode.internal.type !== `File`) {
    return false
  }

  const pathToOtherNode = normalize(joinPath(rootNode.dir, value))
  const otherFileExists = getNodes().some(
    n => n.absolutePath === pathToOtherNode
  )
  if (otherFileExists) {
    registerTrackedPath(nodes[0].internal.type, key)
  }
  return otherFileExists
}

export function shouldInfer(nodes, selector, value) {
  return (
    nodes[0].internal.type !== `File` &&
    ((_.isString(value) &&
      !_.isEmpty(value) &&
      pointsToFile(nodes, selector, value)) ||
      (_.isArray(value) &&
        _.isString(value[0]) &&
        !_.isEmpty(value[0]) &&
        pointsToFile(nodes, selector, value[0])))
  )
}

function createType(fileNodeRootType, isArray) {
  if (!fileNodeRootType) return null

  return {
    type: isArray ? new GraphQLList(fileNodeRootType) : fileNodeRootType,
    resolve: (node, args, { path }, { fieldName }) => {
      let fieldValue = node[fieldName]

      if (!fieldValue) {
        return null
      }

      const findLinkedFileNode = relativePath => {
        // Use the parent File node to create the absolute path to
        // the linked file.
        const fileLinkPath = normalize(
          systemPath.resolve(parentFileNode.dir, relativePath)
        )

        // Use that path to find the linked File node.
        const linkedFileNode = _.find(
          getNodes(),
          n => n.internal.type === `File` && n.absolutePath === fileLinkPath
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
      }

      // Find the File node for this node (we assume the node is something
      // like markdown which would be a child node of a File node).
      const parentFileNode = findRootNode(node)

      // Find the linked File node(s)
      if (isArray) {
        return fieldValue.map(relativePath => findLinkedFileNode(relativePath))
      } else {
        return findLinkedFileNode(fieldValue)
      }
    },
  }
}

export function getType() {
  return type
}

export function getListType() {
  return listType
}
