import { ActionsUnion, IGatsbyState } from "../types"

export const pluginNamesToOwnedNodeTypesReducer = (
  pluginNamesToOwnedNodeTypes: IGatsbyState["pluginNamesToOwnedNodeTypes"] = new Map(),
  action: ActionsUnion
): IGatsbyState["pluginNamesToOwnedNodeTypes"] => {
  switch (action.type) {
    case `SET_TYPE_OWNER`: {
      const { typeName } = action.payload
      const owner = action.plugin.name

      const existingOwner = pluginNamesToOwnedNodeTypes.get(owner)

      if (!existingOwner) {
        pluginNamesToOwnedNodeTypes.set(owner, new Set([typeName]))
      } else {
        existingOwner.add(typeName)
      }

      return pluginNamesToOwnedNodeTypes
    }

    default:
      return pluginNamesToOwnedNodeTypes
  }
}
