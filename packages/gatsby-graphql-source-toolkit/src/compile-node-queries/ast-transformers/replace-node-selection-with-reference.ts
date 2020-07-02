import {
  TypeInfo,
  isInterfaceType,
  Visitor,
  ASTKindToNode,
  getNamedType,
  GraphQLSchema,
  GraphQLInterfaceType,
  FieldNode,
  SelectionNode,
} from "graphql"
import { FragmentMap } from "../../types"
import * as GraphQLAST from "../../utils/ast-nodes"

interface ITransformArgs {
  schema: GraphQLSchema
  typeInfo: TypeInfo
  nodeReferenceFragmentMap: FragmentMap
}

/**
 * Replaces selection of nodes with references to those nodes.
 *
 * For example (assuming `author` is of type `User` which is a gatsby node):
 * {
 *   author {
 *     firstName
 *     email
 *   }
 * }
 * Is transformed to:
 * {
 *   author {
 *     remoteTypeName: __typename
 *     remoteNodeId: id
 *   }
 * }
 */
export function replaceNodeSelectionWithReference(
  args: ITransformArgs
): Visitor<ASTKindToNode> {
  return {
    Field(node: FieldNode): FieldNode | void {
      const type = args.typeInfo.getType()
      if (!type || !node.selectionSet?.selections.length) {
        return undefined
      }
      const namedType = getNamedType(type)
      const fragment = args.nodeReferenceFragmentMap.get(namedType.name)
      if (fragment) {
        return { ...node, selectionSet: fragment.selectionSet }
      }
      if (isInterfaceType(namedType)) {
        return transformInterfaceField(args, node, namedType)
      }
      return undefined
    },
  }
}

function transformInterfaceField(
  args: ITransformArgs,
  node: FieldNode,
  type: GraphQLInterfaceType
): FieldNode | void {
  const possibleTypes = args.schema.getPossibleTypes(type)
  const nodeImeplementations = possibleTypes.some(type =>
    args.nodeReferenceFragmentMap.has(type.name)
  )
  if (!nodeImeplementations) {
    return undefined
  }
  // Replace with inline fragment for each implementation
  const selections: SelectionNode[] = possibleTypes.map(type => {
    const nodeReferenceFragment = args.nodeReferenceFragmentMap.get(type.name)
    return GraphQLAST.inlineFragment(
      type.name,
      nodeReferenceFragment
        ? nodeReferenceFragment.selectionSet.selections
        : node.selectionSet?.selections ?? []
    )
  })
  return {
    ...node,
    selectionSet: {
      kind: `SelectionSet`,
      selections,
    },
  }
}
