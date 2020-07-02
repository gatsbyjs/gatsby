import {
  GraphQLSchema,
  DocumentNode,
  DefinitionNode,
  FragmentDefinitionNode,
  visit,
  TypeInfo,
  visitInParallel,
  visitWithTypeInfo,
  isObjectType,
  BREAK,
} from "graphql"
import {
  FragmentMap,
  IGatsbyFieldAliases,
  IGatsbyNodeConfig,
  RemoteTypeName,
} from "../types"
import * as GraphQLAST from "../utils/ast-nodes"
import { replaceNodeSelectionWithReference } from "./ast-transformers/replace-node-selection-with-reference"
import { buildNodeReferenceFragmentMap } from "./analyze/build-node-reference-fragment-map"
import { removeFragmentNodeIdFields } from "./ast-transformers/remove-fragment-node-id-fields"
import { addRemoteTypeNameField } from "./ast-transformers/add-remote-typename-field"
import {
  buildTypeUsagesMap,
  TypeUsagesMap,
} from "./analyze/build-type-usages-map"
import { aliasFields } from "./ast-transformers/alias-fields"

interface ICompileNodeFragmentsArgs {
  schema: GraphQLSchema
  gatsbyNodeTypes: IGatsbyNodeConfig[]
  fragments: FragmentDefinitionNode[]
  gatsbyFieldAliases: IGatsbyFieldAliases
}

/**
 * Compiles all user-defined custom fragments into "node fragments".
 *
 * "Node fragment" is a fragment that:
 * 1. Is defined on gatsby node type
 * 2. Is "shallow", meaning that all deep selections of other nodes
 *    are replaced with references
 *
 * For example:
 *
 * fragment Post on Post {
 *   title
 *   author {
 *     firstName
 *     email
 *   }
 * }
 * fragment User on User {
 *   lastName
 *   recentPosts {
 *     updatedAt
 *   }
 * }
 *
 * Is compiled into a map:
 * "Post": `
 * fragment Post on Post {
 *   title
 *   author {
 *     remoteTypeName: __typename
 *     remoteNodeId: id
 *   }
 * }
 * fragment User__recentPosts on Post {
 *   updatedAt
 * }
 * `,
 * "User": `
 * fragment User on User {
 *   lastName
 *   recentPosts {
 *     remoteTypeName: __typename
 *     remoteNodeId: id
 *   }
 * }
 * fragment Post__author on User {
 *   firstName
 *   email
 * }
 * `
 */
export function compileNodeFragments(
  args: ICompileNodeFragmentsArgs
): Map<RemoteTypeName, FragmentDefinitionNode[]> {
  const context: ICompileFragmentsContext = {
    schema: args.schema,
    gatsbyNodeTypes: args.gatsbyNodeTypes.reduce(
      (map, config) => map.set(config.remoteTypeName, config),
      new Map()
    ),
    gatsbyFieldAliases: args.gatsbyFieldAliases,
    nodeReferenceFragmentMap: buildNodeReferenceFragmentMap(args),
    typeUsagesMap: buildTypeUsagesMap(args),
  }
  const result = new Map<RemoteTypeName, FragmentDefinitionNode[]>()
  for (const nodeConfig of args.gatsbyNodeTypes) {
    const fragments = compileIntermediateNodeFragments(context, nodeConfig)
    result.set(
      nodeConfig.remoteTypeName,
      transformIntermediateNodeFragments(context, nodeConfig, fragments)
    )
  }
  return result
}

interface ICompileFragmentsContext {
  schema: GraphQLSchema
  gatsbyNodeTypes: Map<RemoteTypeName, IGatsbyNodeConfig>
  gatsbyFieldAliases: IGatsbyFieldAliases
  typeUsagesMap: TypeUsagesMap
  nodeReferenceFragmentMap: FragmentMap
}

function compileIntermediateNodeFragments(
  { schema, typeUsagesMap }: ICompileFragmentsContext,
  gatsbyNodeConfig: IGatsbyNodeConfig
): FragmentDefinitionNode[] {
  const type = schema.getType(gatsbyNodeConfig.remoteTypeName)
  if (!isObjectType(type)) {
    return []
  }
  const allTypes: string[] = [
    gatsbyNodeConfig.remoteTypeName,
    ...type.getInterfaces().map(iface => iface.name),
  ]
  const result: FragmentDefinitionNode[] = []
  for (const typeName of allTypes) {
    const typeUsages = typeUsagesMap.get(typeName) ?? []
    for (const [typeUsagePath, fields] of typeUsages) {
      result.push(
        GraphQLAST.fragmentDefinition(typeUsagePath, typeName, fields)
      )
    }
  }
  return result
}

function transformIntermediateNodeFragments(
  context: ICompileFragmentsContext,
  gatsbyNodeConfig: IGatsbyNodeConfig,
  intermediateFragments: FragmentDefinitionNode[]
): FragmentDefinitionNode[] {
  const typeInfo = new TypeInfo(context.schema)
  const visitContext = { ...context, gatsbyNodeConfig, typeInfo }

  const doc: DocumentNode = visit(
    GraphQLAST.document(intermediateFragments),
    visitWithTypeInfo(
      typeInfo,
      visitInParallel([
        aliasFields(context.gatsbyFieldAliases),
        addRemoteTypeNameField(visitContext),
        replaceNodeSelectionWithReference(visitContext),

        // Remove id fields from node fragments:
        //   they are already explicitly at the top level of the query
        //   (just a prettify/cleanup transform really)
        removeFragmentNodeIdFields(visitContext),
      ])
    )
  )

  return doc.definitions.filter(isNonEmptyFragment)
}

function isNonEmptyFragment(
  fragment: DefinitionNode
): fragment is FragmentDefinitionNode {
  if (!GraphQLAST.isFragment(fragment)) {
    return false
  }
  let hasFields = false
  visit(fragment, {
    Field: () => {
      hasFields = true
      return BREAK
    },
  })
  return hasFields
}
