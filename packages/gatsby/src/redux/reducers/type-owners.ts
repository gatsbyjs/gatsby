import { stripIndent } from "common-tags"
import { reportOnce } from "../../utils/report-once"
import {
  ActionsUnion,
  IGatsbyNode,
  IGatsbyPlugin,
  IGatsbyState,
} from "../types"

function setTypeOwner(
  typeName: string,
  plugin: IGatsbyPlugin,
  typeOwners: IGatsbyState["typeOwners"],
  fullNode?: IGatsbyNode
): IGatsbyState["typeOwners"] {
  const ownerName = plugin?.name || fullNode?.internal.owner

  if (!ownerName) {
    reportOnce(`No plugin owner for type "${typeName}"`)
    return typeOwners
  }

  const existingOwnerTypes = typeOwners.pluginsToTypes.get(ownerName)

  if (!existingOwnerTypes) {
    typeOwners.pluginsToTypes.set(ownerName, new Set([typeName]))
  } else {
    existingOwnerTypes.add(typeName)
  }

  const existingTypeOwnerNameByTypeName =
    typeOwners.typesToPlugins.get(typeName)

  if (!existingTypeOwnerNameByTypeName) {
    typeOwners.typesToPlugins.set(typeName, ownerName)
  } else if (existingTypeOwnerNameByTypeName !== ownerName) {
    throw new Error(stripIndent`
      The plugin "${ownerName}" created a node of a type owned by another plugin.

      The node type "${typeName}" is owned by "${existingTypeOwnerNameByTypeName}".

      If you copy and pasted code from elsewhere, you'll need to pick a new type name
      for your new node(s).

      ${
        fullNode
          ? stripIndent(
              `The node object passed to "createNode":

              ${JSON.stringify(fullNode, null, 4)}\n`
            )
          : ``
      }
      The plugin creating the node:

      ${JSON.stringify(plugin, null, 4)}
    `)
  }

  return typeOwners
}

export const typeOwnersReducer = (
  typeOwners: IGatsbyState["typeOwners"] = {
    pluginsToTypes: new Map(),
    typesToPlugins: new Map(),
  } as IGatsbyState["typeOwners"],
  action: ActionsUnion
): IGatsbyState["typeOwners"] => {
  switch (action.type) {
    case `DELETE_NODE`: {
      const { plugin, payload: internalNode } = action

      if (plugin && internalNode && !action.isRecursiveChildrenDelete) {
        const pluginName = plugin.name

        const previouslyRecordedOwnerName = typeOwners.typesToPlugins.get(
          internalNode.internal.type
        )

        if (
          internalNode &&
          previouslyRecordedOwnerName &&
          previouslyRecordedOwnerName !== pluginName
        ) {
          throw new Error(stripIndent`
            The plugin "${pluginName}" deleted a node of a type owned by another plugin.

            The node type "${
              internalNode.internal.type
            }" is owned by "${previouslyRecordedOwnerName}".

            The node object passed to "deleteNode":

            ${JSON.stringify(internalNode, null, 4)}

            The plugin deleting the node:

            ${JSON.stringify(plugin, null, 4)}
        `)
        }
      }

      return typeOwners
    }
    case `CREATE_NODE`: {
      const { plugin, oldNode, payload: node } = action
      const { owner, type } = node.internal

      setTypeOwner(type, plugin, typeOwners, node)

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
