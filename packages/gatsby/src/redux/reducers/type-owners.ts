import { ActionsUnion, IGatsbyState } from "../types"

export const pluginNamesToOwnedNodeTypesReducer = (
  pluginNamesToOwnedNodeTypes: IGatsbyState["pluginNamesToOwnedNodeTypes"] = new Map(),
  action: ActionsUnion
): IGatsbyState["pluginNamesToOwnedNodeTypes"] => {
  switch (action.type) {
    case `CREATE_NODE`: {
      const { owner, type } = action.payload.internal

      const existingOwner = pluginNamesToOwnedNodeTypes.get(owner)

      if (!existingOwner) {
        pluginNamesToOwnedNodeTypes.set(owner, new Set([type]))
      } else {
        existingOwner.add(type)
      }

      return pluginNamesToOwnedNodeTypes
    }

    default:
      return pluginNamesToOwnedNodeTypes
  }
}
