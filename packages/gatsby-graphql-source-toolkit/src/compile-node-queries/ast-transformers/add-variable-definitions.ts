import {
  Visitor,
  ASTKindToNode,
  OperationDefinitionNode,
  VariableDefinitionNode,
  TypeInfo,
  GraphQLInputType,
  DocumentNode,
  parseType,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  ArgumentNode,
} from "graphql"
import * as GraphQLAST from "../../utils/ast-nodes"

interface IAddVariableDefinitionsArgs {
  typeInfo: TypeInfo
}

type VariableMap = Map<string, GraphQLInputType>

interface IDefinitionInfo {
  usedFragments: Set<string>
  variables: VariableMap
}

export function addVariableDefinitions({
  typeInfo,
}: IAddVariableDefinitionsArgs): Visitor<ASTKindToNode> {
  const fragmentInfo = new Map<string, IDefinitionInfo>()
  const operationInfo = new Map<string, IDefinitionInfo>()

  let currentDefinition: IDefinitionInfo

  return {
    Document: {
      leave(node: DocumentNode): DocumentNode {
        const result: DocumentNode = {
          ...node,
          definitions: node.definitions.map(def =>
            def.kind === `OperationDefinition`
              ? ensureVariableDefinitions(def, operationInfo, fragmentInfo)
              : def
          ),
        }
        return result
      },
    },
    OperationDefinition: {
      enter(): void {
        currentDefinition = {
          usedFragments: new Set(),
          variables: new Map(),
        }
      },
      leave(node: OperationDefinitionNode): void {
        operationInfo.set(node.name?.value ?? ``, currentDefinition)
      },
    },
    FragmentDefinition: {
      enter(): void {
        currentDefinition = {
          usedFragments: new Set(),
          variables: new Map(),
        }
      },
      leave(node: FragmentDefinitionNode): void {
        fragmentInfo.set(node.name.value, currentDefinition)
      },
    },
    FragmentSpread(node: FragmentSpreadNode): void {
      currentDefinition.usedFragments.add(node.name.value)
    },
    Argument(node: ArgumentNode): void {
      const inputType = typeInfo.getInputType()
      if (node.value.kind === `Variable` && inputType) {
        currentDefinition.variables.set(node.name.value, inputType)
      }
    },
  }
}

function ensureVariableDefinitions(
  node: OperationDefinitionNode,
  operationInfo: Map<string, IDefinitionInfo>,
  fragmentsInfo: Map<string, IDefinitionInfo>
): OperationDefinitionNode {
  const name = node.name?.value ?? ``
  const variables = collectVariables(operationInfo.get(name), fragmentsInfo)
  if (!variables.size) {
    return node
  }
  const variableDefinitions: VariableDefinitionNode[] = []
  for (const [name, inputType] of variables) {
    variableDefinitions.push({
      kind: `VariableDefinition`,
      variable: {
        kind: `Variable`,
        name: GraphQLAST.name(name),
      },
      type: parseType(inputType.toString()),
    })
  }
  return {
    ...node,
    variableDefinitions,
  }
}

function collectVariables(
  definitionInfo: IDefinitionInfo | void,
  fragmentsInfo: Map<string, IDefinitionInfo>,
  visited: Set<IDefinitionInfo> = new Set()
): VariableMap {
  if (!definitionInfo || visited.has(definitionInfo)) {
    return new Map()
  }
  visited.add(definitionInfo)
  const variables = [...definitionInfo.variables]

  for (const fragmentName of definitionInfo.usedFragments) {
    const fragmentVariables = collectVariables(
      fragmentsInfo.get(fragmentName),
      fragmentsInfo,
      visited
    )
    variables.push(...fragmentVariables)
  }
  return new Map(variables)
}
