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
      // @todo check payload for correct values and throw errors
      state.push({
        ...action.payload,
        node: {
          id: action.payload.node.id,
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
