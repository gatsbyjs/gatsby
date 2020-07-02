import { DocumentNode } from "graphql"
import {
  IGatsbyNodeDefinition,
  RemoteTypeName,
  IRemoteId,
  IGatsbyNodeConfig,
} from "../types"

interface IBuildNodeDefinitionArgs {
  gatsbyNodeTypes: IGatsbyNodeConfig[]
  documents: Map<RemoteTypeName, DocumentNode>
}

/**
 * Simple utility that merges user-defined node type configs with compiled
 * queries for every node type, and produces a value suitable for
 * `gatsbyNodeDefs` option of sourcing config.
 */
export function buildNodeDefinitions({
  gatsbyNodeTypes,
  documents,
}: IBuildNodeDefinitionArgs): Map<RemoteTypeName, IGatsbyNodeDefinition> {
  const definitions = new Map<RemoteTypeName, IGatsbyNodeDefinition>()

  gatsbyNodeTypes.forEach(config => {
    const document = documents.get(config.remoteTypeName)

    if (!document) {
      throw new Error(
        `Canot find GraphQL document for ${config.remoteTypeName}`
      )
    }
    definitions.set(config.remoteTypeName, {
      document,
      nodeQueryVariables: (id: IRemoteId) => {
        return { ...id }
      },
      ...config,
    })
  })
  return definitions
}
