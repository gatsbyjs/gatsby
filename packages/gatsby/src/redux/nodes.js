const _ = require(`lodash`)
const Promise = require(`bluebird`)
const { store } = require(`./index`)

/**
 * Get all nodes from redux store.
 *
 * @returns {Array}
 */
const getNodes = () => {
  const nodes = store.getState().nodes
  if (nodes) {
    return Array.from(nodes.values())
  } else {
    return []
  }
}

exports.getNodes = getNodes

const getNode = id => store.getState().nodes.get(id)

/** Get node by id from store.
 *
 * @param {string} id
 * @returns {Object}
 */
exports.getNode = getNode

exports.getNodesByType = type =>
  getNodes().filter(node => node.internal.type === type)

/**
 * Determine if node has changed.
 *
 * @param {string} id
 * @param {string} digest
 * @returns {boolean}
 */
exports.hasNodeChanged = (id, digest) => {
  const node = store.getState().nodes.get(id)
  if (!node) {
    return true
  } else {
    return node.internal.contentDigest !== digest
  }
}

/**
 * Get content for a node from the plugin that created it.
 *
 * @param {Object} node
 * @returns {promise}
 */
exports.loadNodeContent = node => {
  if (_.isString(node.internal.content)) {
    return Promise.resolve(node.internal.content)
  } else {
    return new Promise(resolve => {
      // Load plugin's loader function
      const plugin = store
        .getState()
        .flattenedPlugins.find(plug => plug.name === node.internal.owner)
      const { loadNodeContent } = require(plugin.resolve)
      if (!loadNodeContent) {
        throw new Error(
          `Could not find function loadNodeContent for plugin ${plugin.name}`
        )
      }

      return loadNodeContent(node).then(content => {
        // TODO update node's content field here.
        resolve(content)
      })
    })
  }
}

/**
 * Get node and save path dependency.
 *
 * @param {string} id
 * @param {string} path
 * @returns {Object} node
 */
exports.getNodeAndSavePathDependency = (id, path) => {
  const createPageDependency = require(`./actions/add-page-dependency`)
  const node = getNode(id)
  createPageDependency({ path, nodeId: id })
  return node
}
