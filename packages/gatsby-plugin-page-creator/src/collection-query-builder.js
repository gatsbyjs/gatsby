// Changes something like
//   `/Users/site/src/pages/foo/{id}/{baz__bar}`
// to
//   `id,baz{bar}`
export function queryPartsFromPath(absolutePath) {
  const parts = absolutePath.split(`/`)

  return parts
    .reduce((queryParts, filePathPart) => {
      if (filePathPart.startsWith(`{`) && filePathPart.includes(`}`)) {
        let strippedPart = filePathPart
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
export function generateQueryFromString(str, fields) {
  const needsAllPrefix = str.startsWith(`all`) === false

  return `{${needsAllPrefix ? `all` : ``}${str}{nodes{${fields}}}}`
}
