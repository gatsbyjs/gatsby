import reporter from "gatsby-cli/lib/reporter"

import {
  IGatsbyState,
  ICreateNodeManifest,
  IDeleteNodeManifests,
} from "../types"

export const nodeManifestReducer = (
  state: IGatsbyState["nodeManifests"] = [],
  action: ICreateNodeManifest | IDeleteNodeManifests
): IGatsbyState["nodeManifests"] => {
  switch (action.type) {
    case `CREATE_NODE_MANIFEST`: {
      const {
        manifestId,
        pluginName,
        node,
        updatedAt,
        daysSinceLastUpdate = 30,
      } = action.payload

      const ONE_DAY = 1000 * 60 * 60 * 24 // ms * sec * min * hr

      if (updatedAt) {
        const nodeLastUpdatedAt: number = new Date(updatedAt).getTime()
        if (
          (nodeLastUpdatedAt as any) instanceof Date &&
          !isNaN(nodeLastUpdatedAt)
        ) {
          reporter.warn(
            `Plugin ${pluginName} called unstable_createNodeManifest with an updatedAt that isn't a proper value to instantiate a Date.`
          )

          return state
        }

        const shouldCreateNodeManifest =
          Date.now() - nodeLastUpdatedAt <= daysSinceLastUpdate * ONE_DAY

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
