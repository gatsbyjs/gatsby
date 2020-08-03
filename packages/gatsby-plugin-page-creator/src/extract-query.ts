import _ from "lodash"
import path from "path"

// Input queryStringParent could be a Modle or a full graphql query
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
    const regex = /^\{[a-zA-Z]+\.([a-zA-Z_()]+)\}/.exec(part)

    if (regex === null) return
    const extracted = regex[1]

    const results = _.get(
      queryResults.nodes ? queryResults.nodes[0] : queryResults,
      extracted
        // ignore union syntax for value lookup (unions does not show up in queryResults)
        .replace(/\(.*\)__/g, ``)
        // replace __ with accessors '.'
        .replace(/__/g, `.`)
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
    .reduce<string[]>((queryParts: string[], part: string): string[] => {
      if (part.startsWith(`{`)) {
        return queryParts.concat(
          deriveNesting(
            part
              .replace(/\{[a-zA-Z]+\./, ``)
              .replace(`}`, ``)
              .replace(/\.[a-z]+$/, ``)
          )
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
        path = path.replace(/\(/g, `... on `).replace(/\)/g, ``)

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
