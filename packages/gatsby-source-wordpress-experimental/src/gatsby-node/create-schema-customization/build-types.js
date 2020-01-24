import store from "../../store"
import { transformFields } from "./transform-fields"
import {
  buildTypeName,
  fieldOfTypeWasFetched,
  getTypeSettingsByType,
  filterObjectType,
} from "./helpers"

const unionType = ({ typeDefs, schema, type }) => {
  typeDefs.push(
    schema.buildUnionType({
      name: buildTypeName(type.name),
      types: type.possibleTypes.map(possibleType =>
        buildTypeName(possibleType.name)
      ),
      resolveType: node => {
        if (node.type) {
          return buildTypeName(node.type)
        }

        if (node.__typename) {
          return buildTypeName(node.__typename)
        }

        return null
      },
      extensions: { infer: false },
    })
  )
}

const interfaceType = ({
  type,
  typeDefs,
  schema,
  gatsbyNodeTypes,
  fieldAliases,
  fieldBlacklist,
}) => {
  const state = store.getState()
  const { nodeInterfaceTypes } = state.remoteSchema.ingestibles

  const transformedFields = transformFields({
    fields: type.fields,
    gatsbyNodeTypes,
    fieldAliases,
    fieldBlacklist,
  })

  const typeDef = {
    name: buildTypeName(type.name),
    fields: transformedFields,
    extensions: { infer: false },
  }

  // if this is a node interface type
  if (nodeInterfaceTypes.includes(type.name)) {
    // we add nodeType (post type) to all nodes as they're fetched
    // so we can add them to node interfaces as well in order to filter
    // by a couple different content types
    typeDef.fields[`nodeType`] = `String`
    typeDef.extensions.nodeInterface = {}
  } else {
    // otherwise this is a regular interface type so we need to resolve the type name
    typeDef.resolveType = node =>
      node && node.__typename ? buildTypeName(node.__typename) : null
  }

  typeDefs.push(schema.buildInterfaceType(typeDef))
}

const objectType = typeBuilderApi => {
  const {
    type,
    gatsbyNodeTypes,
    fieldAliases,
    fieldBlacklist,
    typeDefs,
    schema,
    isAGatsbyNode,
  } = typeBuilderApi

  let objectType = {
    name: buildTypeName(type.name),
    fields: transformFields({
      fields: type.fields,
      gatsbyNodeTypes,
      fieldAliases,
      fieldBlacklist,
    }),
    extensions: {
      infer: false,
    },
  }

  if (type.interfaces) {
    objectType.interfaces = type.interfaces
      .filter(interfaceType => {
        const interfaceTypeSettings = getTypeSettingsByType(interfaceType)

        return !interfaceTypeSettings.exclude && fieldOfTypeWasFetched(type)
      })
      .map(({ name }) => buildTypeName(name))
  }

  if (gatsbyNodeTypes.includes(type.name) || isAGatsbyNode) {
    // this is used to filter the node interfaces
    // by different content types (post types)
    objectType.fields[`nodeType`] = `String`

    objectType.interfaces = [`Node`, ...objectType.interfaces]
  }

  // @todo add this as a plugin option
  objectType = filterObjectType(objectType, typeBuilderApi)

  typeDefs.push(schema.buildObjectType(objectType))
}

export default { unionType, interfaceType, objectType }
