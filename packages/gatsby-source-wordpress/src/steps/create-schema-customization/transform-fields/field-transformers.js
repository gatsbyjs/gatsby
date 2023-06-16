import { buildTypeName, findNamedTypeName, findTypeKind } from "../helpers"
import { transformUnion, transformListOfUnions } from "./transform-union"
import {
  transformListOfGatsbyNodes,
  transformGatsbyNodeObject,
} from "./transform-object"
import { getGatsbyNodeTypeNames } from "../../source-nodes/fetch-nodes/fetch-nodes"
import { typeIsABuiltInScalar } from "~/steps/create-schema-customization/helpers"
import { getStore } from "~/store"
import { typeIsExcluded } from "~/steps/ingest-remote-schema/is-excluded"
import { getPluginOptions } from "~/utils/get-gatsby-api"

export const getFieldTransformers = () => {
  const pluginOptions = getPluginOptions()
  const prefix = pluginOptions.schema.typePrefix
  return [
    {
      description: `NON_NULL Scalar`,
      test: field =>
        field.type.kind === `NON_NULL` && field.type.ofType.kind === `SCALAR`,

      transform: ({ field }) => {
        if (typeIsABuiltInScalar(field.type)) {
          return `${findNamedTypeName(field.type.ofType)}!`
        } else {
          return `JSON!`
        }
      },
    },

    {
      description: `NON_NULL list type`,
      test: field =>
        field.type.kind === `NON_NULL` &&
        field.type.ofType.kind === `LIST` &&
        (field.type.ofType.name || field.type.ofType?.ofType?.name),

      transform: ({ field }) => {
        const typeName = findNamedTypeName(field.type)
        const normalizedTypeName = typeIsABuiltInScalar(field.type)
          ? typeName
          : buildTypeName(typeName, prefix)

        return `[${normalizedTypeName}]!`
      },
    },

    {
      description: `Lists of Gatsby node interfaces`,
      test: field => {
        const implementsNodeInterface = getStore()
          .getState()
          .remoteSchema.typeMap.get(findNamedTypeName(field.type))
          ?.interfaces?.some(i => i.name === `Node`)

        const isAListOfGatsbyNodeInterfaces =
          (field.type.kind === `LIST` || field.type.ofType?.kind === `LIST`) &&
          implementsNodeInterface

        return isAListOfGatsbyNodeInterfaces
      },

      transform: args => transformListOfGatsbyNodes({ ...args, pluginOptions }),
    },

    {
      description: `NON_NULL lists of NON_NULL types`,
      test: field =>
        field.type.kind === `NON_NULL` &&
        field.type.ofType.kind === `LIST` &&
        field.type.ofType?.ofType?.kind === `NON_NULL`,

      transform: ({ field, fieldName }) => {
        const originalTypeName = findNamedTypeName(field.type)
        const typeKind = findTypeKind(field.type)

        const normalizedTypeName =
          typeKind === `SCALAR` && typeIsABuiltInScalar(field.type)
            ? originalTypeName
            : buildTypeName(originalTypeName, prefix)

        return {
          type: `[${normalizedTypeName}!]!`,
          resolve: source => {
            const resolvedField = source[fieldName]

            if (typeof resolvedField !== `undefined`) {
              return resolvedField ?? []
            }

            const autoAliasedFieldPropertyName = `${fieldName}__typename_${field?.type?.name}`

            const aliasedField = source[autoAliasedFieldPropertyName]

            return aliasedField ?? []
          },
        }
      },
    },

    {
      description: `Lists of NON_NULL builtin types`,
      test: field =>
        field.type.kind === `LIST` &&
        field.type.ofType.kind === `NON_NULL` &&
        (field.type.ofType.name ?? field.type.ofType?.ofType?.name) &&
        typeIsABuiltInScalar(field.type),

      transform: ({ field }) => `[${findNamedTypeName(field.type)}!]`,
    },

    {
      description: `Lists of NON_NULL types`,
      test: field =>
        field.type.kind === `LIST` &&
        field.type.ofType.kind === `NON_NULL` &&
        (field.type.ofType.name ?? field.type.ofType?.ofType?.name),

      transform: ({ field }) =>
        `[${buildTypeName(findNamedTypeName(field.type), prefix)}!]`,
    },

    {
      description: `ENUM type`,
      test: field => field.type.kind === `ENUM`,
      transform: ({ field }) => buildTypeName(field.type.name, prefix),
    },

    {
      description: `Scalar type`,
      test: field => field.type.kind === `SCALAR`,
      transform: ({ field }) => {
        if (typeIsABuiltInScalar(field.type)) {
          return field.type.name
        } else {
          // custom scalars are typed as JSON
          // @todo if frequently requested,
          // make this hookable so a plugin could register a custom scalar
          return `JSON`
        }
      },
    },

    {
      description: `Gatsby Node Objects or Gatsby Node Interfaces where all possible types are Gatsby Nodes`,
      test: field => {
        const gatsbyNodeTypes = getGatsbyNodeTypeNames()

        const pluginOptions = getPluginOptions()

        const isAnInterfaceTypeOfGatsbyNodes =
          // if this is an interface
          field.type.kind === `INTERFACE` &&
          // and every possible type is a future gatsby node
          getStore()
            .getState()
            // get the full type for this interface
            .remoteSchema.typeMap.get(findNamedTypeName(field.type))
            // filter out any excluded types
            .possibleTypes?.filter(
              possibleType =>
                !typeIsExcluded({
                  pluginOptions,
                  typeName: possibleType.name,
                })
            )
            // if every remaining type is a Gatsby node type
            // then use this field transformer
            ?.every(possibleType => gatsbyNodeTypes.includes(possibleType.name))

        return (
          (gatsbyNodeTypes.includes(field.type.name) &&
            field.type.kind === `OBJECT`) ||
          isAnInterfaceTypeOfGatsbyNodes
        )
      },

      transform: args => transformGatsbyNodeObject({ ...args, pluginOptions }),
    },

    {
      description: `Lists of Gatsby Node Object types`,
      test: field => {
        const gatsbyNodeTypes = getGatsbyNodeTypeNames()

        const {
          remoteSchema: { typeMap },
        } = getStore().getState()

        return (
          // this is a list of Gatsby nodes
          (field.type.kind === `LIST` &&
            field.type.ofType.kind === `OBJECT` &&
            gatsbyNodeTypes.includes(field.type.ofType.name)) ||
          // or it's a list of an interface type which Gatsby nodes implement
          (field.type.kind === `LIST` &&
            field.type.ofType.kind === `INTERFACE` &&
            typeMap
              .get(field.type.ofType.name)
              ?.possibleTypes?.find(possibleType =>
                gatsbyNodeTypes.includes(possibleType.name)
              ))
        )
      },

      transform: args => transformListOfGatsbyNodes({ ...args, pluginOptions }),
    },

    {
      description: `Non-Gatsby Node Objects`,
      test: field => field.type.kind === `OBJECT`,
      transform: ({ field }) => buildTypeName(field.type.name, prefix),
    },

    {
      description: `Lists of Non Gatsby Node Objects`,
      test: field =>
        field.type.kind === `LIST` &&
        (field.type.ofType.kind === `OBJECT` ||
          field.type.ofType.kind === `ENUM`),

      transform: ({ field }) =>
        `[${buildTypeName(field.type.ofType.name, prefix)}]`,
    },

    {
      description: `Lists of Union types`,
      test: field =>
        field.type.kind === `LIST` && field.type.ofType.kind === `UNION`,

      transform: args => transformListOfUnions({ ...args, pluginOptions }),
    },

    {
      description: `Lists of Scalar types`,
      test: field =>
        field.type.kind === `LIST` && field.type.ofType.kind === `SCALAR`,

      transform: ({ field }) => {
        if (typeIsABuiltInScalar(field.type)) {
          return `[${field.type.ofType.name}]`
        } else {
          return `[JSON]`
        }
      },
    },

    {
      description: `Lists of Interface types`,
      test: field =>
        field.type.kind === `LIST` && field.type.ofType.kind === `INTERFACE`,

      transform: ({ field }) =>
        `[${buildTypeName(findNamedTypeName(field.type), prefix)}]`,
    },

    {
      description: `Union type`,
      test: field => field.type.kind === `UNION`,
      transform: args => transformUnion({ ...args, pluginOptions }),
    },

    {
      description: `Interface type`,
      test: field => field.type.kind === `INTERFACE`,
      transform: ({ field }) => buildTypeName(field.type.name, prefix),
    },

    {
      description: `Lists of NON_NULL types`,
      test: field =>
        findTypeKind(field.type) !== `LIST` && field.type.kind === `NON_NULL`,
      transform: ({ field }) =>
        `${buildTypeName(findNamedTypeName(field.type), prefix)}!`,
    },

    // for finding unhandled types
    // {
    //   description: `Unhandled type`,
    //   test: () => true,
    //   transform: ({ field }) => dd(field),
    // },
  ]
}
