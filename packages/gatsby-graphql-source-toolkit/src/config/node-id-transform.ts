import {
  IGatsbyFieldAliases,
  IGatsbyNodeDefinition,
  INodeIdTransform,
  IRemoteNode,
  IRemoteId,
} from "../types"
import { Node } from "gatsby"
import { inspect } from "util"

export function createNodeIdTransform(
  gatsbyFieldAliases: IGatsbyFieldAliases
): INodeIdTransform {
  return {
    remoteNodeToGatsbyId(
      remoteNode: IRemoteNode,
      def: IGatsbyNodeDefinition
    ): string {
      const idValues = def.remoteIdFields.map(idField => {
        const alias = gatsbyFieldAliases[idField] ?? idField
        if (!remoteNode.hasOwnProperty(alias)) {
          throw new Error(
            `Missing field ${alias} in the remote node of type ${def.remoteTypeName}`
          )
        }
        return remoteNode[alias]
      })
      return idValues.join(`:`)
    },
    gatsbyNodeToRemoteId(
      gatsbyNode: Node,
      def: IGatsbyNodeDefinition
    ): IRemoteId {
      return def.remoteIdFields.reduce((acc, idField) => {
        const alias = gatsbyFieldAliases[idField] ?? idField
        if (!gatsbyNode.hasOwnProperty(alias)) {
          throw new Error(
            `Missing expected field ${alias} in the Gatsby node ${gatsbyNode.internal.type}: ${gatsbyNode.id}`
          )
        }
        acc[idField] = gatsbyNode[alias]
        return acc
      }, {})
    },
    remoteIdToGatsbyNodeId(
      remoteId: IRemoteId,
      def: IGatsbyNodeDefinition
    ): string {
      const remoteNodePartial = Object.keys(remoteId).reduce(
        (node, idField) => {
          const alias = gatsbyFieldAliases[idField] ?? idField
          node[alias] = remoteId[idField]
          return node
        },
        {}
      )
      return this.remoteNodeToGatsbyId(remoteNodePartial, def)
    },
    remoteNodeToId(
      remoteNode: IRemoteNode,
      def: IGatsbyNodeDefinition
    ): IRemoteId {
      return def.remoteIdFields.reduce((acc, idField) => {
        const alias = gatsbyFieldAliases[idField] ?? idField
        if (!remoteNode.hasOwnProperty(alias)) {
          throw new Error(
            `Missing expected field ${alias} in the remote node ${
              def.remoteTypeName
            }: ${inspect(remoteNode)}`
          )
        }
        acc[idField] = remoteNode[alias]
        return acc
      }, {})
    },
  }
}
