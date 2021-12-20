import reporter from "gatsby-cli/lib/reporter"

import {
  IGatsbyState,
  ICreateNodeManifest,
  IDeleteNodeManifests,
} from "../types"

const ONE_DAY = 1000 * 60 * 60 * 24 // ms * sec * min * hr.
const DEFAULT_MAX_DAYS_OLD = 30

export const nodeManifestReducer = (
  state: IGatsbyState["nodeManifests"] = [],
  action: ICreateNodeManifest | IDeleteNodeManifests
): IGatsbyState["nodeManifests"] => {
  switch (action.type) {
    case `CREATE_NODE_MANIFEST`: {
      const { manifestId, pluginName, node, updatedAtUTC } = action.payload

      const maxDaysOld =
        Number(process.env.NODE_MANIFEST_MAX_DAYS_OLD) || DEFAULT_MAX_DAYS_OLD

      if (updatedAtUTC) {
        const nodeLastUpdatedAtUTC: number = new Date(updatedAtUTC).getTime()
        if (
          (nodeLastUpdatedAtUTC as any) instanceof Date &&
          !isNaN(nodeLastUpdatedAtUTC)
        ) {
          reporter.warn(
            `Plugin ${pluginName} called unstable_createNodeManifest with an updatedAtUTC that isn't a proper value to instantiate a Date.`
          )

          return state
        }

        const shouldCreateNodeManifest =
          Date.now() - nodeLastUpdatedAtUTC <= maxDaysOld * ONE_DAY

        if (!shouldCreateNodeManifest) {
          return state
        }
      }

      if (typeof manifestId !== `string`) {
        reporter.warn(
          `Plugin ${pluginName} called unstable_createNodeManifest with a manifestId that isn't a string.`
        )

        return state
      }

      if (!node?.id) {
        reporter.warn(
          `Plugin ${pluginName} called unstable_createNodeManifest but didn't provide a node.`
        )

        return state
      }

      state.push({
        manifestId,
        pluginName,
        node: {
          id: node.id,
        },
      })

      return state
    }

    case `DELETE_NODE_MANIFESTS`: {
      state = []

      return state
    }

    default:
      return state
  }
}
