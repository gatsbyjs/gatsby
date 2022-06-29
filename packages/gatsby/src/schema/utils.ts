import {
  isAbstractType,
  getNamedType,
  GraphQLSchema,
  isObjectType,
  isInterfaceType,
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLUnionType,
} from "graphql"
import {
  InterfaceTypeComposer,
  NamedTypeComposer,
  ObjectTypeComposer,
  SchemaComposer,
} from "graphql-compose"

import type { IGatsbyNodePartial } from "../datastore/in-memory/indexing"
import { IGatsbyNode } from "../internal"
import { store } from "../redux"

export const toNodeTypeNames = (
  schema: GraphQLSchema,
  gqlTypeName:
    | string
    | GraphQLObjectType
    | GraphQLInterfaceType
    | GraphQLUnionType
): Array<string> => {
  const gqlType =
    typeof gqlTypeName === `string` ? schema.getType(gqlTypeName) : gqlTypeName

  if (!gqlType || !(isObjectType(gqlType) || isAbstractType(gqlType))) {
    return []
  }

  const possibleTypes = isAbstractType(gqlType)
    ? schema.getPossibleTypes(gqlType)
    : [gqlType]

  return possibleTypes
    .filter(type => type.getInterfaces().some(iface => iface.name === `Node`))
    .map(type => type.name)
}

export function isObjectOrInterfaceTypeComposer(
  type: NamedTypeComposer<any>
): type is ObjectTypeComposer | InterfaceTypeComposer {
  return (
    type instanceof ObjectTypeComposer || type instanceof InterfaceTypeComposer
  )
}

export const fieldNeedToResolve = ({
  schema,
  gqlType,
  typeComposer,
  schemaComposer,
  fieldName,
}: {
  schema: GraphQLSchema
  gqlType: GraphQLObjectType | GraphQLInterfaceType
  typeComposer: ObjectTypeComposer<any> | InterfaceTypeComposer<any>
  schemaComposer: SchemaComposer<any>
  fieldName: string
}): boolean => {
  const nodeTypeNames = toNodeTypeNames(schema, gqlType)

  const possibleTCs: Array<ObjectTypeComposer | InterfaceTypeComposer> = [
    typeComposer,
    ...nodeTypeNames
      .map(name => schemaComposer.getAnyTC(name))
      .filter(isObjectOrInterfaceTypeComposer),
  ]

  for (const tc of possibleTCs) {
    if (tc.getFieldExtension(fieldName, `needsResolve`) || false) {
      return true
    }
  }

  return false
}

export const fieldPathNeedToResolve = ({
  selector,
  type,
}: {
  selector: string
  type: string | GraphQLObjectType | GraphQLInterfaceType
}): boolean => {
  const {
    schema,
    schemaCustomization: { composer: schemaComposer },
  } = store.getState()

  if (!schemaComposer) {
    throw new Error(`Schema composer isn't set yet`)
  }

  const selectors =
    typeof selector === `string` ? selector.split(`.`) : selector

  let gqlType = typeof type === `string` ? schema.getType(type) : type

  if (!gqlType || !(isObjectType(gqlType) || isInterfaceType(gqlType))) {
    return false
  }

  for (let i = 0; i < selectors.length; i++) {
    const fieldName = selectors[i]
    const typeComposer = schemaComposer.getAnyTC(gqlType.name)

    if (!isObjectOrInterfaceTypeComposer(typeComposer)) {
      return false
    }

    if (
      fieldNeedToResolve({
        schema,
        gqlType,
        typeComposer,
        schemaComposer,
        fieldName,
      })
    ) {
      return true
    }

    const nextType = getNamedType(gqlType.getFields()[fieldName].type)
    if (!nextType || !(isObjectType(nextType) || isInterfaceType(nextType))) {
      return false
    } else {
      gqlType = nextType
    }
  }

  return false
}

export function getResolvedFields(
  node: IGatsbyNode | IGatsbyNodePartial
): undefined | Record<string, any> {
  const typeName = node.internal.type
  const resolvedNodes = store.getState().resolvedNodesCache.get(typeName)
  return resolvedNodes?.get(node.id)
}
