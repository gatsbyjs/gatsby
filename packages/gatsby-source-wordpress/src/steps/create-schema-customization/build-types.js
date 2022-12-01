import store from "~/store"
import { transformFields } from "./transform-fields"
import { typeIsExcluded } from "~/steps/ingest-remote-schema/is-excluded"
import {
  buildTypeName,
  filterTypeDefinition,
  getTypesThatImplementInterfaceType,
} from "./helpers"

const unionType = typeBuilderApi => {
  const { schema, type, pluginOptions } = typeBuilderApi

  const types = type.possibleTypes
    .filter(
      possibleType =>
        !typeIsExcluded({
          pluginOptions,
          typeName: possibleType.name,
        })
    )
    .map(possibleType => buildTypeName(possibleType.name))

  if (!types || !types.length) {
    return false
  }

  let unionType = {
    name: buildTypeName(type.name),
    types,
    resolveType: node => {
      if (node.__typename) {
        return buildTypeName(node.__typename)
      }

      return null
    },
    extensions: {
      infer: false,
    },
  }

  // @todo add this as a plugin option
  unionType = filterTypeDefinition(unionType, typeBuilderApi, `UNION`)

  return schema.buildUnionType(unionType)
}

const interfaceType = typeBuilderApi => {
  const { type, schema } = typeBuilderApi

  const state = store.getState()
  const { ingestibles } = state.remoteSchema
  const { nodeInterfaceTypes } = ingestibles

  const implementingTypes = getTypesThatImplementInterfaceType(type)

  const transformedFields = transformFields({
    parentInterfacesImplementingTypes: implementingTypes,
    parentType: type,
    fields: type.fields,
  })

  if (!transformedFields) {
    return null
  }

  let typeDef = {
    name: buildTypeName(type.name),
    fields: transformedFields,
    extensions: { infer: false },
  }

  // this is a regular interface type, not a node interface type so we need to resolve the type name
  if (!nodeInterfaceTypes.includes(type.name)) {
    typeDef.resolveType = node =>
      node?.__typename ? buildTypeName(node.__typename) : null
  }

  typeDef = filterTypeDefinition(typeDef, typeBuilderApi, `INTERFACE`)

  return schema.buildInterfaceType(typeDef)
}

const objectType = typeBuilderApi => {
  const { type, gatsbyNodeTypes, fieldAliases, fieldBlacklist, schema } =
    typeBuilderApi

  const transformedFields = transformFields({
    fields: type.fields,
    parentType: type,
    gatsbyNodeTypes,
    fieldAliases,
    fieldBlacklist,
  })

  // if all child fields are excluded, this type shouldn't exist.
  // check null first, otherwise cause:
  // TypeError: Cannot convert undefined or null to object at Function.keys (<anonymous>)
  // Also cause wordpress blog site build failure in createSchemaCustomization step
  if (!transformedFields || !Object.keys(transformedFields).length) {
    return false
  }

  let objectType = {
    name: buildTypeName(type.name),
    fields: transformedFields,
    description: type.description,
    extensions: {
      infer: false,
    },
  }

  if (type.interfaces?.includes(`Node`)) {
    objectType.interfaces = [`Node`]
  }

  // @todo add this as a plugin option
  objectType = filterTypeDefinition(objectType, typeBuilderApi, `OBJECT`)

  return schema.buildObjectType(objectType)
}

const enumType = ({ schema, type }) =>
  schema.buildEnumType({
    name: buildTypeName(type.name),
    values: type.enumValues.reduce((accumulator, { name }) => {
      accumulator[name] = { name }

      return accumulator
    }, {}),
    description: type.description,
  })

export default { unionType, interfaceType, objectType, enumType }
