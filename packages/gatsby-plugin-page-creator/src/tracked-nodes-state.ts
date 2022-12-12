import { extractModel } from "./path-utils"
import type { IOptions } from "./types"

export interface ICreateAPageFromNodeArgs {
  node: Record<string, Record<string, unknown>>
  absolutePath: string
}
export interface IStatePerInstance {
  changedNodesSinceLastPageCreation: {
    deleted: Map<string, { id: string; contentDigest: string }>
    created: Map<string, { id: string; contentDigest: string; type: string }>
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
  /**
   * Cleanup tracked state after removal of template file
   */
  templateFileRemoved: (absolutePath: string) => void
  /**
   * keep track of pages created by node id and template file path
   */
  nodeIdToPagePath: Map<string, Map<string, string>>
  /**
   * list of known page paths to avoid trying to creating pages that already exist
   */
  knownPagePaths: Set<string>
  /**
   * construct a page path from template absolute path and resolved node fields
   */
  getPathFromAResolvedNode?: (arg: ICreateAPageFromNodeArgs) => Promise<string>
  /**
   * create a page from a node and template absolute path
   */
  createAPageFromNode?: (
    arg: ICreateAPageFromNodeArgs
  ) => Promise<{ errors: number; path: string } | undefined>
  /**
   * delete all pages created from a node id
   */
  deletePagesCreateFromNode?: (id: string) => void
  /**
   * run graphql query to resolve fields for given node ids
   */
  resolveFields?: (
    nodeIds: Array<string>,
    absolutePath: string
  ) => Promise<Array<Record<string, Record<string, unknown>>>>
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
      },
      trackedTypes: new Map(),
      nodeIdToPagePath: new Map(),
      knownPagePaths: new Set(),
      templateFileRemoved(absolutePath: string): void {
        const nodeType = extractModel(absolutePath)
        if (nodeType) {
          const absolutePaths = this.trackedTypes.get(nodeType)
          if (absolutePaths) {
            absolutePaths.delete(absolutePath)
            if (absolutePaths.size === 0) {
              this.trackedTypes.delete(nodeType)
            }
          }
        }

        for (const [
          nodeId,
          templatesToPagePaths,
        ] of this.nodeIdToPagePath.entries()) {
          const pagePaths = templatesToPagePaths.get(absolutePath)
          if (pagePaths) {
            for (const pagePath of pagePaths) {
              this.knownPagePaths.delete(pagePath)
            }
            templatesToPagePaths.delete(absolutePath)
            if (templatesToPagePaths.size === 0) {
              this.nodeIdToPagePath.delete(nodeId)
            }
          }
        }
      },
    }

    pluginInstances.set(pluginOptions.path, pluginInstance)
  }

  return pluginInstance
}
