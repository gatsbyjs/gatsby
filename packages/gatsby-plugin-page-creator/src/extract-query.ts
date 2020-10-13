import _ from "lodash"
import path from "path"
import {
  compose,
  convertUnionSyntaxToGraphql,
  extractField,
  extractFieldWithoutUnion,
  removeFileExtension,
  switchToPeriodDelimiters,
} from "./path-utils"

// Input queryStringParent could be a Model or a full graphql query
// End result should be something like { allProducts { nodes { id }}}
export function generateQueryFromString(
  queryOrModel: string,
  fileAbsolutePath: string
): string {
  const fields = extractUrlParamsForQuery(fileAbsolutePath)
  if (queryOrModel.includes(`...CollectionPagesQueryFragment`)) {
    return fragmentInterpolator(queryOrModel, fields)
  }

  return `{all${queryOrModel}{nodes{${fields}}}}`
}

// Takes a query result of something like `{ fields: { value: 'foo' }}` with a filepath of `/fields__value` and
// translates the object into `{ fields__value: 'foo' }`. This is necassary to pass the value
// into a query function for each individual page.
export function reverseLookupParams(
  queryResults: Record<string, object | string>,
  absolutePath: string
): Record<string, string> {
  const reversedParams = {
    // We always include id
    id: (queryResults.nodes ? queryResults.nodes[0] : queryResults).id,
  }

  absolutePath.split(path.sep).forEach(part => {
    const extracted = compose(
      removeFileExtension,
      extractFieldWithoutUnion
    )(part)

    const results = _.get(
      queryResults.nodes ? queryResults.nodes[0] : queryResults,
      // replace __ with accessors '.'
      switchToPeriodDelimiters(extracted)
    )
    reversedParams[extracted] = results
  })

  return reversedParams
}

// Changes something like
//   `/Users/site/src/pages/foo/{Model.id}/{Model.baz}`
// to
//   `id,baz`
function extractUrlParamsForQuery(createdPath: string): string {
  const parts = createdPath.split(path.sep)

  // always add `id` to queries
  if (parts.some(s => s.includes(`.id}`)) === false) {
    parts.push(`{Model.id}`)
  }

  return parts
    .reduce<Array<string>>((queryParts: Array<string>, part: string): Array<
      string
    > => {
      if (part.startsWith(`{`)) {
        return queryParts.concat(
          deriveNesting(compose(removeFileExtension, extractField)(part))
        )
      }

      return queryParts
    }, [])
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

function fragmentInterpolator(query: string, fields: string): string {
  return query.replace(`...CollectionPagesQueryFragment`, `nodes{${fields}}`)
}
