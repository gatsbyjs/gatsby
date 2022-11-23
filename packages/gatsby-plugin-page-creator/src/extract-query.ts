import { hasFeature } from "gatsby-plugin-utils"
import _ from "lodash"
import path from "path"
import {
  convertUnionSyntaxToGraphql,
  extractField,
  extractFieldWithoutUnion,
  switchToPeriodDelimiters,
} from "./path-utils"

// Input queryStringParent could be a Model or a full graphql query
// End result should be something like { allProducts { nodes { id }}}
export function generateQueryFromString(
  queryOrModel: string,
  fileAbsolutePath: string,
  nodeIds?: Array<string>
): string {
  // TODO: 'fields' possibly contains duplicate fields, e.g. field{name},field{description} that should be merged to field{name,description}
  const fields = extractUrlParamsForQuery(fileAbsolutePath)

  // In case queryOrModel is not capitalized
  const connectionQuery = _.camelCase(`all ${queryOrModel}`)

  const connectionArgs = nodeIds
    ? `(filter: { id: { in: ${JSON.stringify(nodeIds)} } })`
    : ``

  return `{${connectionQuery}${connectionArgs}{nodes{${fields}}}}`
}

// Takes a query result of something like `{ fields: { value: 'foo' }}` with a filepath of `/fields__value` and
// translates the object into `{ fields__value: 'foo' }`. This is necassary to pass the value
// into a query function for each individual page.
export function reverseLookupParams(
  queryResults: Record<string, Record<string, unknown> | string>,
  absolutePath: string
): Record<string, string> {
  const reversedParams = {
    // We always include id
    id: (queryResults.nodes ? queryResults.nodes[0] : queryResults).id,
  }

  absolutePath.split(path.sep).forEach(part => {
    const extracted = extractFieldWithoutUnion(part)

    extracted.forEach(extract => {
      if (extract === ``) return

      const results = _.get(
        queryResults.nodes ? queryResults.nodes[0] : queryResults,
        // replace __ with accessors '.'
        switchToPeriodDelimiters(extract)
      )
      reversedParams[extract] = results
    })
  })

  return reversedParams
}

// Changes something like `/Users/site/src/pages/foo/{Model.id}/{Model.baz}` to `id,baz,internal{contentFilePath}`.
// Also supports prefixes/postfixes, e.g. `/foo/prefix-{Model.id}` to `id`
function extractUrlParamsForQuery(createdPath: string): string {
  const parts = createdPath.split(path.sep)

  // always add `id` to queries
  if (parts.some(s => s.includes(`.id}`)) === false) {
    parts.push(`{Model.id}`)
  }

  // Always add internal { contentFilePath } if feature is available
  if (hasFeature(`content-file-path`)) {
    parts.push(`{Model.internal__contentFilePath}`)
  }

  return parts
    .reduce<Array<string>>(
      (queryParts: Array<string>, part: string): Array<string> => {
        if (part.includes(`{`) && part.includes(`}`)) {
          const fields = extractField(part)
          const derived = fields.map(f => deriveNesting(f))

          return queryParts.concat(derived)
        }

        return queryParts
      },
      []
    )
    .join(`,`)
}

// pulls out nesting from file names with the special __ syntax
// src/pages/{Model.fields__baz}.js => `fields{baz}`
// src/pages/{Model.fields__(File)__baz}.js => `fields{... on File {baz}}`
function deriveNesting(part: string): string {
  if (part.includes(`__`)) {
    return part
      .split(`__`)
      .reverse()
      .reduce((path: string, part: string): string => {
        // This adds support for Unions
        path = convertUnionSyntaxToGraphql(path)

        if (path) {
          return `${part}{${path}}`
        }
        return `${part}${path}`
      }, ``)
  }
  return part
}
