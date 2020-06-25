import path from "path"

// This extracts params from its filePath counerpart
// and returns an object of it's matches.
// e.g.,
//   /foo/{id}, /foo/123 => {id: 123}
export function getCollectionRouteParams(
  filePath: string,
  urlPath: string
): Record<string, string> {
  const params = {}
  // remove the starting path to simplify the loop
  const fileParts = filePath.split(path.sep)
  const urlParts = urlPath.split(path.sep)

  fileParts.forEach((part, i) => {
    if (!part.startsWith(`{`)) return

    const key = part.replace(`{`, ``).replace(`}`, ``)
    params[key] = urlParts[i]
  })

  return params
}
