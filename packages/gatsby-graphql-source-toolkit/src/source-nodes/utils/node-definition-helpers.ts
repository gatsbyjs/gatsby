import { DocumentNode, OperationDefinitionNode } from "graphql"
import { IGatsbyNodeDefinition, ISourcingContext } from "../../types"

export function collectListOperationNames(doc: DocumentNode): string[] {
  return collectOperationNames(doc, /^LIST/)
}

export function collectNodeOperationNames(doc: DocumentNode): string[] {
  return collectOperationNames(doc, /^NODE/)
}

export function collectNodeFieldOperationNames(doc: DocumentNode): string[] {
  return collectOperationNames(doc, /^NODE_FIELD/)
}

function collectOperationNames(
  document: DocumentNode,
  regex: RegExp
): string[] {
  return document.definitions
    .filter(
      (def): def is OperationDefinitionNode =>
        def.kind === `OperationDefinition`
    )
    .map(def => (def.name ? def.name.value : ``))
    .filter(name => regex.test(name))
}

export function findNodeOperationName(def: IGatsbyNodeDefinition): string {
  const operationName = collectNodeOperationNames(def.document)[0]
  if (!operationName) {
    throw new Error(
      `Could not find node re-fetching operation for ${def.remoteTypeName}`
    )
  }
  return operationName
}

export function getGatsbyNodeDefinition(
  context: ISourcingContext,
  remoteTypeName: string
): IGatsbyNodeDefinition {
  const nodeDefinition = context.gatsbyNodeDefs.get(remoteTypeName)

  if (!nodeDefinition) {
    throw new Error(
      `Missing Gatsby node definition for remote type ${remoteTypeName}`
    )
  }

  return nodeDefinition
}
