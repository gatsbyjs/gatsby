import _ from "lodash"
import { Node } from "gatsby"
import { store } from "../redux"
import * as reduxNodes from "../redux/nodes"

type TDatabaseNodes = `loki` | `redux`

export const backend = (process.env.GATSBY_DB_NODES ||
  `redux`) as TDatabaseNodes

let nodesDb: typeof reduxNodes
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

/**
 * Get content for a node from the plugin that created it.
 */
export function loadNodeContent(node: Node): Promise<string> {
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
} = nodesDb

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
