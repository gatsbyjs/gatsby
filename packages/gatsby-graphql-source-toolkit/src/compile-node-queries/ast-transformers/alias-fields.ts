import { FieldNode, Visitor, ASTKindToNode } from "graphql"
import { IGatsbyFieldAliases } from "../../types"
import * as GraphQLAST from "../../utils/ast-nodes"

export function aliasFields(map: IGatsbyFieldAliases): Visitor<ASTKindToNode> {
  return {
    Field: (node: FieldNode): FieldNode | void => aliasField(node, map),
  }
}

export function aliasField(
  node: FieldNode,
  map: IGatsbyFieldAliases
): FieldNode | void {
  if (!map[node.name.value]) {
    return undefined
  }
  const alias = map[node.name.value]
  const newFieldNode: FieldNode = {
    ...node,
    alias: GraphQLAST.name(alias),
  }
  return newFieldNode
}
