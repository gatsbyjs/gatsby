import { stripIndent } from "common-tags"
import { ActionsUnion, IGatsbyPlugin, IGatsbyState } from "../types"

export const typeOwnersReducer = (
  typeOwners: IGatsbyState["typeOwners"] = {
    pluginsToTypes: new Map(),
    typesToPlugins: new Map(),
  },
  action: ActionsUnion,
  plugin: IGatsbyPlugin
): IGatsbyState["typeOwners"] => {
  switch (action.type) {
    case `CREATE_NODE`: {
      const { oldNode, payload: node } = action
      const { owner, type } = node.internal

      const existingOwnerTypes = typeOwners.pluginsToTypes.get(owner)

      if (!existingOwnerTypes) {
        typeOwners.pluginsToTypes.set(owner, new Set([type]))
      } else {
        existingOwnerTypes.add(type)
      }

      const existingTypeOwnerNameByTypeName =
        typeOwners.typesToPlugins.get(type)

      if (!existingTypeOwnerNameByTypeName) {
        typeOwners.typesToPlugins.set(type, owner)
      } else if (existingTypeOwnerNameByTypeName !== owner) {
        throw new Error(stripIndent`
          The plugin "${owner}" created a node of a type owned by another plugin.

          The node type "${type}" is owned by "${existingTypeOwnerNameByTypeName}".

          If you copy and pasted code from elsewhere, you'll need to pick a new type name
          for your new node(s).

          The node object passed to "createNode":

          ${JSON.stringify(node, null, 4)}

          The plugin creating the node:

          ${JSON.stringify(plugin, null, 4)}
        `)
      }

      // If the node has been created in the past, check that
      // the current plugin is the same as the previous.
      if (oldNode && oldNode.internal.owner !== owner) {
        throw new Error(
          stripIndent`
            Nodes can only be updated by their owner. Node "${node.id}" is
            owned by "${oldNode.internal.owner}" and another plugin "${owner}"
            tried to update it.
          `
        )
      }

      return typeOwners
    }

    default:
      return typeOwners
  }
}
