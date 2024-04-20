import {
  isAbstractType,
  getNamedType,
  type GraphQLSchema,
  isObjectType,
  isInterfaceType,
} from "graphql"
import {
  InterfaceTypeComposer,
  type NamedTypeComposer,
  ObjectTypeComposer,
  type SchemaComposer,
} from "graphql-compose"
import isPlainObject from "lodash/isPlainObject"

import type { IGatsbyNodePartial } from "../datastore/in-memory/indexing"
import type { IGatsbyNode } from "../internal"
import { store } from "../redux"
import type { IQueryArgs, ISort } from "../datastore/types"
import type { GatsbyGraphQLType } from "../.."

//

export function toNodeTypeNames(
  schema: GraphQLSchema,
  gqlTypeName: GatsbyGraphQLType | undefined,
): Array<string> {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: NamedTypeComposer<any>,
): type is ObjectTypeComposer | InterfaceTypeComposer {
  return (
    type instanceof ObjectTypeComposer || type instanceof InterfaceTypeComposer
  )
}

export function fieldNeedToResolve({
  schema,
  gqlType,
  typeComposer,
  schemaComposer,
  fieldName,
}: {
  schema: GraphQLSchema
  gqlType?: GatsbyGraphQLType | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeComposer: ObjectTypeComposer<any> | InterfaceTypeComposer<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemaComposer: SchemaComposer<any>
  fieldName: string
}): boolean {
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

export function fieldPathNeedToResolve({
  selector,
  type,
}: {
  selector: string | Array<string>
  type?: GatsbyGraphQLType | undefined
}): boolean {
  const {
    schema,
    schemaCustomization: { composer: schemaComposer },
  } = store.getState()

  if (!schemaComposer) {
    throw new Error(`Schema composer isn't set yet`)
  }

  const selectors =
    typeof selector === `string` ? selector.split(`.`) : selector

  let gqlType: GatsbyGraphQLType | undefined =
    typeof type === `string` ? schema.getType(type) : type

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

    const nextType: GatsbyGraphQLType | undefined = getNamedType(
      gqlType.getFields()[fieldName].type,
    )

    if (!nextType || !(isObjectType(nextType) || isInterfaceType(nextType))) {
      return false
    } else {
      gqlType = nextType
    }
  }

  return false
}

export function getResolvedFields(
  node: IGatsbyNode | IGatsbyNodePartial,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): undefined | Record<string, any> {
  const typeName = node.internal.type
  const resolvedNodes = store.getState().resolvedNodesCache.get(typeName)
  return resolvedNodes?.get(node.id)
}

// type NestedPathStructure = INestedPathStructureNode | true | "ASC" | "DESC"

// export type INestedPathStructureNode = {
//   [key: string]: NestedPathStructure
// }

export function pathObjectToPathString(input: ISort): {
  path: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  leaf: any
} {
  const path: Array<string> = []
  let currentValue: ISort | undefined = input
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export function maybeConvertSortInputObjectToSortPath(
  args: IQueryArgs,
): IQueryArgs {
  if (!args.sort) {
    return args
  }

  if (_CFLAGS_.GATSBY_MAJOR === `5`) {
    // check if it's already in expected format
    if (
      Array.isArray(args.sort?.fields) &&
      Array.isArray(args.sort?.order) &&
      args.sort.order.every(item => {
        return (
          typeof item === `string` &&
          (item.toLowerCase() === `asc` || item.toLowerCase() === `desc`)
        )
      })
    ) {
      return args
    }

    const sorts: Array<ISort> = [args.sort]

    const modifiedSort: {
      fields: Array<string>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      order: Array<any>
    } = {
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
