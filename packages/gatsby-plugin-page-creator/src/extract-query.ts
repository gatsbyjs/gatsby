import _ from "lodash"

// Input queryStringParent could be:
//   Product
//   allProduct
//   allProduct(filter: thing)
// End result should be something like { allProducts { nodes { id }}}
export function generateQueryFromString(
  queryStringParent: string,
  fileAbsolutePath: string
): string {
  const needsAllPrefix = queryStringParent.startsWith(`all`) === false
  const fields = extractUrlParamsForQuery(fileAbsolutePath)
  console.log(fields)

  return `{${
    needsAllPrefix ? `all` : ``
  }${queryStringParent}{nodes{${fields}}}}`
}

// Takes a query result of something like `{ fields: { value: 'foo' }}` with a filepath of `/fields__value` and
// translates the object into `{ fields__value: 'foo' }`. This is necassary to pass the value
// into a query function for each individual page.
export function reverseLookupParams(
  queryResults: string,
  absolutePath: string
): Record<string, string> {
  const reversedParams = {}

  absolutePath.split(`/`).forEach(part => {
    const regex = /^\{([a-zA-Z_]+)\}/.exec(part)

    if (regex === null) return
    const extracted = regex[1]

    const results = _.get(queryResults, extracted.replace(/__/g, `.`))
    reversedParams[extracted] = results
  })

  return reversedParams
}

// Changes something like
//   `/Users/site/src/pages/foo/{id}/{baz}`
// to
//   `id,baz`
function extractUrlParamsForQuery(createdPath: string): string {
  const parts = createdPath.split(`/`)
  return parts
    .reduce((queryParts, part) => {
      if (part.startsWith(`{`)) {
        return queryParts.concat(
          deriveNesting(
            part.replace(`{`, ``).replace(`}`, ``).replace(`.js`, ``)
          )
        )
      }

      return queryParts
    }, [])
    .join(`,`)
}

function deriveNesting(part: string): string {
  if (part.includes(`__`)) {
    return part
      .split(`__`)
      .reverse()
      .reduce((path, part) => {
        if (path) {
          return `${part}{${path}}`
        }
        return `${part}${path}`
      }, ``)
  }
  return part
}
