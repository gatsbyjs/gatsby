import {
  TypeInfo,
  Visitor,
  ASTKindToNode,
  SelectionSetNode,
  isCompositeType,
} from "graphql"
import * as GraphQLAST from "../../utils/ast-nodes"
import { IGatsbyFieldAliases } from "../../types"

interface IAddTypeNameArgs {
  typeInfo: TypeInfo
  gatsbyFieldAliases: IGatsbyFieldAliases
}

export function addRemoteTypeNameField({
  typeInfo,
  gatsbyFieldAliases,
}: IAddTypeNameArgs): Visitor<ASTKindToNode> {
  return {
    SelectionSet: node => {
      if (
        isCompositeType(typeInfo.getParentType()) &&
        !hasRemoteTypeNameField(node, gatsbyFieldAliases)
      ) {
        const field = GraphQLAST.field(
          `__typename`,
          gatsbyFieldAliases[`__typename`]
        )
        return { ...node, selections: [field, ...node.selections] }
      }
      return
    },
  }
}

function hasRemoteTypeNameField(
  node: SelectionSetNode,
  aliases: IGatsbyFieldAliases
) {
  return node.selections.some(node =>
    node.kind === `Field`
      ? node.name.value === `__typename` &&
        (!node.alias || node.alias.value === aliases[`__typename`])
      : false
  )
}
