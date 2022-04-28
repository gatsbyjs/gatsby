import slugify from "slugify"
import _ from "lodash"
import { GraphQLEnumType, lexicographicSortSchema } from "graphql"
import type { GraphQLSchema } from "graphql"
import { filterSchema, mapSchema, MapperKind } from "@graphql-tools/utils"
import { IDefinitionMeta } from "../../redux/types"

type DefinitionName = string
type DefinitionMap = Map<DefinitionName, IDefinitionMeta>

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

export function filterPluginSchema(
  schema: GraphQLSchema,
  typeFilter = (): boolean => true
): GraphQLSchema {
  return mapSchema(
    filterSchema({
      schema,
      typeFilter,
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

export function stabilizeSchema(
  schema: GraphQLSchema,
  typeFilter = (): boolean => true
): GraphQLSchema {
  return lexicographicSortSchema(filterPluginSchema(schema, typeFilter))
}

function guessIfUnnnamedQuery({
  isStaticQuery,
  name,
  filePath,
}: IDefinitionMeta): boolean {
  const queryType = isStaticQuery ? `static` : `page`
  const generatedQueryName = slugify(filePath, {
    replacement: ` `,
    lower: false,
  })
  const pattern = _.camelCase(`${queryType}-${generatedQueryName}`)
  return name.startsWith(pattern)
}

function guessIfThirdpartyDefinition({ filePath }: IDefinitionMeta): boolean {
  return /(node_modules|\.yarn|\.cache)/.test(filePath)
}

function isFragmentDefinition(def: IDefinitionMeta): boolean {
  return def.isFragment
}

function isThirdpartyFragment(def: IDefinitionMeta): boolean {
  return isFragmentDefinition(def) && guessIfThirdpartyDefinition(def)
}

function isTargetDefinition(def: IDefinitionMeta): boolean {
  if (isThirdpartyFragment(def)) {
    return true
  }
  return !(guessIfThirdpartyDefinition(def) || guessIfUnnnamedQuery(def))
}

export function filterTargetDefinitions(
  defMap: DefinitionMap
): Map<string, IDefinitionMeta> {
  const defs: Array<[name: string, def: IDefinitionMeta]> = []
  for (const [name, def] of defMap) {
    if (isTargetDefinition(def)) {
      defs.push([name, def])
    }
  }
  return new Map(defs)
}
