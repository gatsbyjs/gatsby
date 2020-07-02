import {
  FieldNode,
  GraphQLSchema,
  TypeInfo,
  visit,
  visitWithTypeInfo,
  visitInParallel,
  Visitor,
  ASTKindToNode,
  getNamedType,
  isUnionType,
} from "graphql"
import {
  IGatsbyNodeDefinition,
  IRemoteFieldUsage,
  ISourcingPlan,
  RemoteFieldAlias,
  RemoteTypeName,
} from "../../types"

interface IBuildSourcingPlanArgs {
  schema: GraphQLSchema
  gatsbyNodeDefs: Map<RemoteTypeName, IGatsbyNodeDefinition>
}

export function buildSourcingPlan(args: IBuildSourcingPlanArgs): ISourcingPlan {
  return {
    fetchedTypeMap: buildFetchedTypeMap(args),
    remoteNodeTypes: new Set(args.gatsbyNodeDefs.keys()),
  }
}

function buildFetchedTypeMap(
  args: IBuildSourcingPlanArgs
): Map<RemoteTypeName, Map<RemoteFieldAlias, IRemoteFieldUsage>> {
  const schema = args.schema
  const fetchedTypesMap: ISourcingPlan["fetchedTypeMap"] = new Map()
  const typeInfo = new TypeInfo(schema)

  const Visitors: {
    collectTypeFields: Visitor<ASTKindToNode>
    addUnionTypes: Visitor<ASTKindToNode>
  } = {
    collectTypeFields: {
      Field(node: FieldNode): void {
        const parentTypeName = typeInfo.getParentType()?.name ?? ``
        if (
          parentTypeName === schema.getQueryType()?.name ||
          parentTypeName === schema.getMutationType()?.name
        ) {
          return undefined
        }
        const aliasNode = node.alias ?? node.name

        if (!fetchedTypesMap.has(parentTypeName)) {
          fetchedTypesMap.set(parentTypeName, new Map())
        }
        const fetchedFields = fetchedTypesMap.get(parentTypeName) as Map<
          RemoteFieldAlias,
          IRemoteFieldUsage
        >
        fetchedFields.set(aliasNode.value, {
          alias: aliasNode.value,
          name: node.name.value,
        })
        return undefined
      },
    },
    addUnionTypes: {
      Field(): void {
        // Union types must be added separately because they don't have fields
        //  by themselves and as such won't be added by `collectTypeFields`
        const type = typeInfo.getType()
        if (!type) {
          return undefined
        }
        const unionType = getNamedType(type)
        if (!isUnionType(unionType)) {
          return undefined
        }
        if (!fetchedTypesMap.has(unionType.name)) {
          fetchedTypesMap.set(unionType.name, new Map())
        }
        return undefined
      },
    },
  }

  const visitor = visitWithTypeInfo(
    typeInfo,
    visitInParallel([Visitors.collectTypeFields, Visitors.addUnionTypes])
  )

  for (const [, def] of args.gatsbyNodeDefs) {
    // TODO: optimize visitorKeys
    visit(def.document, visitor)
  }

  return fetchedTypesMap
}
