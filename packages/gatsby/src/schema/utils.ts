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
import isPlainObject from "lodash/isPlainObject"

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

type NestedPathStructure = INestedPathStructureNode | true | "ASC" | "DESC"

export interface INestedPathStructureNode {
  [key: string]: NestedPathStructure
}

export function pathObjectToPathString(input: INestedPathStructureNode): {
  path: string
  leaf: any
} {
  const path: Array<string> = []
  let currentValue: NestedPathStructure | undefined = input
  let leaf: any = undefined
  while (currentValue) {
    if (isPlainObject(currentValue)) {
      const entries = Object.entries(currentValue)
      if (entries.length !== 1) {
        throw new Error(`Invalid field arg`)
      }
      for (const [key, value] of entries) {
        path.push(key)
        currentValue = value
      }
    } else {
      leaf = currentValue
      currentValue = undefined
    }
  }

  return {
    path: path.join(`.`),
    leaf,
  }
}

export function maybeConvertSortInputObjectToSortPath(args: any): any {
  if (!args.sort) {
    return args
  }

  if (_CFLAGS_.GATSBY_MAJOR === `5`) {
    // check if it's already in expected format
    if (
      Array.isArray(args.sort?.fields) &&
      Array.isArray(args.sort?.order) &&
      args.sort.order.every(
        item =>
          typeof item === `string` &&
          (item.toLowerCase() === `asc` || item.toLowerCase() === `desc`)
      )
    ) {
      return args
    }

    let sorts = args.sort

    if (!Array.isArray(sorts)) {
      sorts = [sorts]
    }

    const modifiedSort: any = {
      fields: [],
      order: [],
    }

    for (const sort of sorts) {
      const { path, leaf } = pathObjectToPathString(sort)
      modifiedSort.fields.push(path)
      modifiedSort.order.push(leaf)
    }

    return {
      ...args,
      sort: modifiedSort,
    }
  }

  return args
}
