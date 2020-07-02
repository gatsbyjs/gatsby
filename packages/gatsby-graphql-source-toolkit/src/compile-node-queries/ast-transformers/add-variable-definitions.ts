import {
  Visitor,
  ASTKindToNode,
  OperationDefinitionNode,
  VariableDefinitionNode,
  TypeInfo,
  GraphQLInputType,
  DocumentNode,
  parseType,
} from "graphql"
import * as GraphQLAST from "../../utils/ast-nodes"

interface IAddVariableDefinitionsArgs {
  typeInfo: TypeInfo
}

type VariableMap = Map<string, GraphQLInputType>

interface DefinitionInfo {
  usedFragments: Set<string>
  variables: VariableMap
}

export function addVariableDefinitions({
  typeInfo,
}: IAddVariableDefinitionsArgs): Visitor<ASTKindToNode> {
  const fragmentInfo = new Map<string, DefinitionInfo>()
  const operationInfo = new Map<string, DefinitionInfo>()

  let currentDefinition: DefinitionInfo

  return {
    Document: {
      leave: node => {
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
      enter: () => {
        currentDefinition = {
          usedFragments: new Set(),
          variables: new Map(),
        }
      },
      leave: node => {
        operationInfo.set(node.name?.value ?? ``, currentDefinition)
      },
    },
    FragmentDefinition: {
      enter: () => {
        currentDefinition = {
          usedFragments: new Set(),
          variables: new Map(),
        }
      },
      leave: node => {
        fragmentInfo.set(node.name.value, currentDefinition)
      },
    },
    FragmentSpread: node => {
      currentDefinition.usedFragments.add(node.name.value)
    },
    Argument: node => {
      const inputType = typeInfo.getInputType()
      if (node.value.kind === `Variable` && inputType) {
        currentDefinition.variables.set(node.name.value, inputType)
      }
    },
  }
}

function ensureVariableDefinitions(
  node: OperationDefinitionNode,
  operationInfo: Map<string, DefinitionInfo>,
  fragmentsInfo: Map<string, DefinitionInfo>
) {
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
  definitionInfo: DefinitionInfo | void,
  fragmentsInfo: Map<string, DefinitionInfo>,
  visited: Set<DefinitionInfo> = new Set()
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
