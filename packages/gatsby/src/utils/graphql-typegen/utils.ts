import slugify from "slugify"
import _ from "lodash"
import { lexicographicSortSchema } from "graphql"
import type { GraphQLSchema } from "graphql"
import { IDefinitionMeta } from "../../redux/types"

type DefinitionName = string
type DefinitionMap = Map<DefinitionName, IDefinitionMeta>

export function stabilizeSchema(schema: GraphQLSchema): GraphQLSchema {
  return lexicographicSortSchema(schema)
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
