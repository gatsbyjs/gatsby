// Changes something like
//   `/Users/site/src/pages/foo/{id}/{baz__bar}`
// to
//   `id,baz{bar}`
export function queryPartsFromPath(absolutePath: string): string {
  const parts = absolutePath.split(`/`)

  return parts
    .reduce<string[]>((queryParts, filePathPart) => {
      if (filePathPart.startsWith(`{`) && filePathPart.includes(`}`)) {
        const strippedPart = filePathPart
          .replace(`{`, ``)
          .replace(`}`, ``)
          .replace(/\..+/, ``)

        queryParts.push(
          strippedPart.split(`__`).reduce((nestedResolutions, part, i) => {
            if (i === 0) return part

            return `${nestedResolutions}{${part}}`
          }, ``)
        )
      }

      return queryParts
    }, [])
    .join(`,`)
}

// Input str could be:
//   Product
//   allProduct
//   allProduct(filter: thing)
// End result should be something like { allProducts { nodes { id }}}
export function generateQueryFromString(str: string, fields: string): string {
  const needsAllPrefix = str.startsWith(`all`) === false

  return `{${needsAllPrefix ? `all` : ``}${str}{nodes{${fields}}}}`
}
