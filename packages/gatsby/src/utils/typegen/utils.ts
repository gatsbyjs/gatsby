import { GraphQLEnumType, lexicographicSortSchema } from "graphql"
import type { GraphQLSchema } from "graphql"
import { filterSchema, mapSchema, MapperKind } from "@graphql-tools/utils"

const fieldFilterFromCoordinates =
  (coords: Array<string>) =>
  (coord: {
    typeName?: string
    fieldName?: string
    argName?: string
  }): boolean => {
    const target = [coord.typeName, coord.fieldName, coord.argName]
      .filter(Boolean)
      .join(`.`)
    return !coords.includes(target)
  }

/**
 * Remove the plugin options schema.
 * Almost all users do not use it, but it unnecessarily increases the schema output size.
 */
export function filterPluginSchema(schema: GraphQLSchema): GraphQLSchema {
  return mapSchema(
    filterSchema({
      schema,
      typeFilter: typeName => !typeName.startsWith(`SitePlugin`),
      fieldFilter: (typeName, fieldName) =>
        fieldFilterFromCoordinates([
          `Query.allSitePlugin`,
          `Query.sitePlugin`,
          `SitePage.pluginCreatorId`,
        ])({ typeName, fieldName }),
      // @ts-ignore - Wrong types
      inputObjectFieldFilter: (typeName, fieldName) =>
        fieldFilterFromCoordinates([
          `SitePageFilterInput.pluginCreator`,
          `SitePageFilterInput.pluginCreatorId`,
        ])({ typeName, fieldName }),
      argumentFilter: (typeName, fieldName, argName) =>
        fieldFilterFromCoordinates([
          `Query.sitePage.pluginCreator`,
          `Query.sitePage.pluginCreatorId`,
        ])({ typeName, fieldName, argName }),
    }),
    {
      [MapperKind.ENUM_TYPE]: type => {
        if (type.name === `SitePageFieldsEnum`) {
          const config = type.toConfig()
          for (const key of Object.keys(config.values)) {
            if (key.startsWith(`pluginCreator`)) {
              delete config.values[key]
            }
          }
          return new GraphQLEnumType(config)
        }
        return undefined
      },
    }
  )
}

export function stabilizeSchema(schema: GraphQLSchema): GraphQLSchema {
  return lexicographicSortSchema(filterPluginSchema(schema))
}
