import _ from "lodash"
import { store } from "../redux"
import { IGatsbyNode } from "../redux/types"
import * as reduxNodes from "../redux/nodes"
import { runSift as runQuery } from "../redux/run-sift"

/**
 * Get content for a node from the plugin that created it.
 */
export function loadNodeContent(node: IGatsbyNode): Promise<string> {
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

const {
  getNodes,
  getNode,
  getNodesByType,
  getTypes,
  hasNodeChanged,
  getNodeAndSavePathDependency,
  saveResolvedNodes,
} = reduxNodes

export {
  getNodes,
  getNode,
  getNodesByType,
  getTypes,
  hasNodeChanged,
  getNodeAndSavePathDependency,
  saveResolvedNodes,
  runQuery,
}
