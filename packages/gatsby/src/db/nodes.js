/* @flow */
const _ = require(`lodash`)
const { store } = require(`../redux`)
const nodesDb: NodeStore = require(`../redux/nodes`)
const { runFastFiltersAndSort } = require(`../redux/run-fast-filters`)

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

/**
 * Get content for a node from the plugin that created it.
 *
 * @param {Object} node
 * @returns {promise}
 */
function loadNodeContent(node) {
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

module.exports = {
  ...nodesDb,
  runQuery: runFastFiltersAndSort,
  loadNodeContent,
}
