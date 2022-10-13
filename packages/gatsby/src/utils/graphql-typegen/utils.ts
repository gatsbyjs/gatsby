import slugify from "slugify"
import _ from "lodash"
import { lexicographicSortSchema } from "graphql"
import type { GraphQLSchema } from "graphql"
import { IDefinitionMeta } from "../../redux/types"

type DefinitionName = string
type DefinitionMap = Map<DefinitionName, IDefinitionMeta>

/**
 * Makes the schema deterministic by sorting it (so on new saves the whole file doesn't change, only the change that was made). It can be used for e.g. tests when two schema diffs should be compared.
 */
export function stabilizeSchema(schema: GraphQLSchema): GraphQLSchema {
  return lexicographicSortSchema(schema)
}

export function sortDefinitions(
  a: IDefinitionMeta,
  b: IDefinitionMeta
): number {
  return a.name.localeCompare(b.name)
}

/**
 * Internally in Gatsby we use the function generateQueryName:
 * packages/gatsby/src/query/file-parser.js
 * This function re-implements this partially to guess if a query is unnamed
 */
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

/**
 * We don't want third-party definitions/queries unless it's a fragment.
 * We also don't want unnamed queries ending up in the TS types.
 */
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
