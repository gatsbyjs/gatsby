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

const TYPE_NAME_EXCLUDES = [
  `Internal`,
  `InternalInput`,
  `Node`,
  `NodeInput`,
  `Directory`,
  `File`,
  `PageInfo`,
  `SiteFunction`,
  `SiteFlags`,
  `SitePage`,
]

function typeNameFilter(typeName: string): boolean {
  if (TYPE_NAME_EXCLUDES.includes(typeName)) {
    return false
  }
  if (typeName.startsWith(`SitePlugin`)) {
    return false
  }
  if (
    typeName.endsWith(`SortInput`) ||
    typeName.endsWith(`FilterInput`) ||
    typeName.endsWith(`OperatorInput`) ||
    typeName.endsWith(`GroupConnection`) ||
    typeName.endsWith(`Connection`) ||
    typeName.endsWith(`Edge`) ||
    typeName.endsWith(`Enum`)
  ) {
    return false
  }
  return true
}

export function filterPluginSchema(
  schema: GraphQLSchema,
  strict = false
): GraphQLSchema {
  return mapSchema(
    filterSchema({
      schema,
      typeFilter: typeName =>
        strict ? typeNameFilter(typeName) : !typeName.startsWith(`SitePlugin`),
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
  strict = false
): GraphQLSchema {
  return lexicographicSortSchema(filterPluginSchema(schema, strict))
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

function isTargetDefinition(def: IDefinitionMeta): boolean {
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
