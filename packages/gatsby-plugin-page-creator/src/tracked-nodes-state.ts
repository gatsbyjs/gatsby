import type { Node } from "gatsby"
import { IOptions } from "./types"

export interface IStatePerInstance {
  changedNodesSinceLastPageCreation: {
    deleted: Map<string, { node: Node }>
    created: Map<string, { node: Node }>
    updated: Map<string, { node: Node; oldNode: Node }>
  }
  /**
   * nodeType to list of absolute file paths using that node type
   */
  trackedTypes: Map<string, Set<string>>
  /**
   * applies changes to pages (creates, updates, deletes) based
   * on node changes
   */
  syncPages?: () => void
}

const pluginInstances = new Map<string, IStatePerInstance>()

export function getPluginInstance(
  pluginOptions: Pick<IOptions, "path">
): IStatePerInstance {
  let pluginInstance = pluginInstances.get(pluginOptions.path)
  if (!pluginInstance) {
    pluginInstance = {
      changedNodesSinceLastPageCreation: {
        created: new Map(),
        deleted: new Map(),
        updated: new Map(),
      },
      trackedTypes: new Map(),
    }

    pluginInstances.set(pluginOptions.path, pluginInstance)
  }

  return pluginInstance
}
