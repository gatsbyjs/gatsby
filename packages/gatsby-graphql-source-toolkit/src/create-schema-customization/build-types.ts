import { GatsbyGraphQLType, Node } from "gatsby"
import {
  isInterfaceType,
  isObjectType,
  isUnionType,
  GraphQLUnionType,
  GraphQLObjectType,
  GraphQLInterfaceType,
} from "graphql"
import { ISchemaCustomizationContext } from "../types"
import { buildFields } from "./build-fields"
import { resolveRemoteType } from "./utils/resolve-remote-type"

// TODO: Pass only the very necessary args to builders as custom resolvers will stay in memory forever
//   and we don't want to capture too much scope

function unionType(
  context: ISchemaCustomizationContext,
  type: GraphQLUnionType
) {
  const {
    gatsbyApi: { schema },
    sourcingPlan: { fetchedTypeMap },
    typeNameTransform,
  } = context

  const types = context.schema
    .getPossibleTypes(type)
    .filter(type => fetchedTypeMap.has(type.name))
    .map(type => typeNameTransform.toGatsbyTypeName(type.name))

  if (!types.length) {
    return
  }

  return schema.buildUnionType({
    name: typeNameTransform.toGatsbyTypeName(type.name),
    types,
    resolveType: (source: any) => {
      if (source?.internal?.type) {
        return source.internal.type
      }
      const remoteTypeName = resolveRemoteType(context, source)
      if (remoteTypeName) {
        return typeNameTransform.toGatsbyTypeName(remoteTypeName)
      }
      return null
    },
  })
}

function isGatsbyNode(source: any): source is Node {
  return source?.internal && source?.internal?.type
}

function interfaceType(
  context: ISchemaCustomizationContext,
  type: GraphQLInterfaceType
) {
  const {
    gatsbyApi: { schema },
    typeNameTransform,
  } = context

  const typeConfig = {
    name: typeNameTransform.toGatsbyTypeName(type.name),
    fields: buildFields(context, type),
    resolveType: (source: any) => {
      if (isGatsbyNode(source)) {
        return source.internal.type
      }
      const remoteTypeName = resolveRemoteType(context, source)
      if (remoteTypeName) {
        return typeNameTransform.toGatsbyTypeName(remoteTypeName)
      }
      return null
    },
    extensions: { infer: false },
  }

  return schema.buildInterfaceType(typeConfig)
}

function objectType(
  context: ISchemaCustomizationContext,
  type: GraphQLObjectType
) {
  const {
    gatsbyApi: { schema },
    typeNameTransform,
  } = context

  const typeConfig = {
    name: typeNameTransform.toGatsbyTypeName(type.name),
    fields: buildFields(context, type),
    interfaces: collectGatsbyTypeInterfaces(context, type),
    extensions: { infer: false },
  }

  return schema.buildObjectType(typeConfig)
}

function collectGatsbyTypeInterfaces(
  context: ISchemaCustomizationContext,
  remoteType: GraphQLObjectType
) {
  const {
    sourcingPlan: { fetchedTypeMap },
    typeNameTransform,
  } = context

  const ifaces = remoteType
    .getInterfaces()
    .filter(remoteIfaceType => fetchedTypeMap.has(remoteIfaceType.name))
    .map(remoteIfaceType =>
      typeNameTransform.toGatsbyTypeName(remoteIfaceType.name)
    )

  if (context.gatsbyNodeDefs.has(remoteType.name)) {
    ifaces.push(`Node`)
  }
  return ifaces
}

export function buildTypeDefinition(
  context: ISchemaCustomizationContext,
  typeName: string
): GatsbyGraphQLType | void {
  const type = context.schema.getType(typeName)

  if (isObjectType(type)) {
    return objectType(context, type)
  }
  if (isInterfaceType(type)) {
    return interfaceType(context, type)
  }
  if (isUnionType(type)) {
    return unionType(context, type)
  }
  return undefined
}
