/* @flow */
const _ = require(`lodash`)
const { store } = require(`../redux`)

interface NodeStore {
  getNodes: () => Array<any>;
  getNode: (id: string) => any | undefined;
  getNodesByType: (type: string) => Array<any>;
  getTypes: () => Array<string>;
  hasNodeChanged: (id: string, digest: string) => boolean;
  getNodeAndSavePathDependency: (id: string, path: string) => any | undefined;
  runQuery: (args: {
    gqlType: GraphQLType,
    queryArgs: Object,
    firstOnly: boolean,
    resolvedFields: Object,
    nodeTypeNames: Array<string>,
  }) => any | undefined;
}

const backend = process.env.GATSBY_DB_NODES || `redux`
let nodesDb: NodeStore
let runQuery
switch (backend) {
  case `redux`:
    nodesDb = require(`../redux/nodes`)
    runQuery = require(`../redux/run-sift`).runSift
    break
  case `loki`:
    nodesDb = require(`./loki/nodes`)
    runQuery = require(`./loki/nodes-query`)
    break
  default:
    throw new Error(
      `Unsupported DB nodes backend (value of env var GATSBY_DB_NODES)`
    )
}

module.exports = { ...nodesDb, runQuery, backend }

/**
 * Get content for a node from the plugin that created it.
 *
 * @param {Object} node
 * @returns {promise}
 */
module.exports.loadNodeContent = node => {
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
