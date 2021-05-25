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
      const { manifestId, pluginName, node } = action.payload

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
        ...action.payload,
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
