import {
  Visitor,
  ASTKindToNode,
  SelectionNode,
  FragmentDefinitionNode,
} from "graphql"
import { IGatsbyFieldAliases, IGatsbyNodeConfig } from "../../types"

interface IRemoveNodeIdFieldsArgs {
  gatsbyFieldAliases: IGatsbyFieldAliases
  gatsbyNodeConfig: IGatsbyNodeConfig
}

export function removeFragmentNodeIdFields({
  gatsbyNodeConfig,
  gatsbyFieldAliases,
}: IRemoveNodeIdFieldsArgs): Visitor<ASTKindToNode> {
  const idAliases = new Set(
    gatsbyNodeConfig.remoteIdFields.map(
      fieldName => gatsbyFieldAliases[fieldName] || fieldName
    )
  )
  return {
    FragmentDefinition: {
      leave(node: FragmentDefinitionNode): FragmentDefinitionNode | void {
        const selections = node.selectionSet.selections.filter(
          (selection: SelectionNode) => {
            if (selection.kind !== `Field`) {
              return true
            }
            const fieldAlias = selection.alias
              ? selection.alias.value
              : selection.name.value

            return !idAliases.has(fieldAlias)
          }
        )
        if (selections.length !== node.selectionSet.selections.length) {
          return {
            ...node,
            selectionSet: {
              ...node.selectionSet,
              selections,
            },
          }
        }
        return undefined
      },
    },
  }
}
