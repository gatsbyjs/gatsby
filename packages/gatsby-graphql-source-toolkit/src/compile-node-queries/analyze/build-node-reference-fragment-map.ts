import {
  GraphQLSchema,
  GraphQLInterfaceType,
  GraphQLObjectType,
  isObjectType,
} from "graphql"
import { flatMap } from "lodash"
import { FragmentMap, IGatsbyNodeConfig, RemoteTypeName } from "../../types"
import * as GraphQLAST from "../../utils/ast-nodes"

/**
 * Create reference fragment for every node type
 * and put it to a Map<TypeName, FragmentDefinitionNode>.
 *
 * "Reference fragment" is a fragment that contains all necessary fields
 * required to find the actual node in gatsby store (i.e. type, id).
 *
 * For example:
 *
 * fragment NodeTypeReference on NodeType {
 *   remoteTypeName: __typename
 *   remoteNodeId: id
 * }
 *
 * Resulting map also includes fragments for node interfaces.
 * "Node interface" is an interface having only node types as it's implementors
 *
 * (if there is at least one non-node type then an interface
 * can not be considered a "node interface")
 */
export function buildNodeReferenceFragmentMap({
  schema,
  gatsbyNodeTypes: nodes,
}: {
  schema: GraphQLSchema
  gatsbyNodeTypes: IGatsbyNodeConfig[]
}): FragmentMap {
  const nodeReferenceFragmentMap: FragmentMap = new Map()
  const possibleNodeInterfaces: GraphQLInterfaceType[] = []
  const nodesMap = new Map<RemoteTypeName, IGatsbyNodeConfig>()

  // Add reference fragments for simple node object types
  nodes.forEach(config => {
    const { remoteTypeName, remoteIdFields } = config
    const nodeType = schema.getType(remoteTypeName)
    if (!isObjectType(nodeType)) {
      throw new Error(
        `Only object types can be defined as gatsby nodes. Got ${remoteTypeName}`
      )
    }
    const fragment = GraphQLAST.fragmentDefinition(
      remoteTypeName,
      remoteTypeName,
      remoteIdFields.map(fieldName => GraphQLAST.field(fieldName))
    )
    nodeReferenceFragmentMap.set(remoteTypeName, fragment)
    possibleNodeInterfaces.push(...nodeType.getInterfaces())
    nodesMap.set(remoteTypeName, config)
  })

  // Detect node interfaces and add reference fragments for those
  new Set<GraphQLInterfaceType>(possibleNodeInterfaces).forEach(iface => {
    const possibleTypes = schema.getPossibleTypes(iface)
    if (!allPossibleTypesAreNodes(possibleTypes, nodesMap)) {
      return
    }
    const idFields = collectAllIdFields(possibleTypes, nodesMap)
    if (!hasAllIdFields(iface, idFields)) {
      return
    }
    const fragment = GraphQLAST.fragmentDefinition(
      iface.name,
      iface.name,
      Array.from(idFields).map(fieldName => GraphQLAST.field(fieldName))
    )
    nodeReferenceFragmentMap.set(iface.name, fragment)
  })

  return nodeReferenceFragmentMap
}

function allPossibleTypesAreNodes(
  possibleTypes: readonly GraphQLObjectType[],
  nodesMap: Map<RemoteTypeName, IGatsbyNodeConfig>
): boolean {
  return possibleTypes.every(type => nodesMap.has(type.name))
}

function collectAllIdFields(
  possibleTypes: readonly GraphQLObjectType[],
  nodesMap: Map<RemoteTypeName, IGatsbyNodeConfig>
): Set<string> {
  const allIds = flatMap(
    possibleTypes,
    type => nodesMap.get(type.name)?.remoteIdFields ?? []
  )
  return new Set(allIds)
}

function hasAllIdFields(
  iface: GraphQLInterfaceType,
  idFields: Set<string>
): boolean {
  const fields = iface.getFields()
  for (const fieldName of idFields) {
    if (!fields[fieldName] && fieldName !== `__typename`) {
      return false
    }
  }
  return true
}
