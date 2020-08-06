// This extracts params from its filePath counerpart
// and returns an object of it's matches.
// e.g.,

import {
  compose,
  extractFieldWithoutUnion,
  removeFileExtension,
} from "./path-utils"

//   /foo/{Product.id}, /foo/123 => {id: 123}
export function getCollectionRouteParams(
  urlTemplate: string,
  urlPath: string
): Record<string, string> {
  const params = {}
  // remove the starting path to simplify the loop
  const urlTemplateParts = urlTemplate.split(`/`)
  const urlParts = urlPath.split(`/`)

  urlTemplateParts.forEach((part, i) => {
    if (!part.startsWith(`{`)) return

    const key = compose(removeFileExtension, extractFieldWithoutUnion)(part)

    params[key] = urlParts[i]
  })

  return params
}
