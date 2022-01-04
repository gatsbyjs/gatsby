import { extractFieldWithoutUnion, removeFileExtension } from "./path-utils"

// This extracts params from its filePath counerpart
// and returns an object of it's matches.
// e.g. /foo/{Product.id}, /foo/123 => {id: 123}
export function getCollectionRouteParams(
  urlTemplate: string,
  urlPath: string
): Record<string, string> {
  const params = {}

  // Remove file extension first so that urlTemplate and urlPath have the same shape
  const cleanedUrlTemplate = removeFileExtension(urlTemplate)
  const urlTemplateParts = cleanedUrlTemplate.split(`/`)
  // Create a regex string for later use by creating groups for all { } finds
  // e.g. /foo/prefix-{Product.id} => /foo/prefix-(.+)
  const templateRegex = cleanedUrlTemplate
    .replace(/\./g, `\\.`) // Escape dots
    .replace(/(\{.*?\})/g, `(.+)`)
    .split(`/`)
  const urlParts = urlPath.split(`/`)

  urlTemplateParts.forEach((part, i) => {
    if (!part.includes(`{`) || !part.includes(`}`)) {
      return
    }
    // Use the previously created regex to match prefix-123 to prefix-(.+)
    const match = urlParts[i]?.match(templateRegex[i])

    if (!match) {
      return
    }

    const keys = extractFieldWithoutUnion(part)

    keys.some((k, j) => {
      params[k] = match[j + 1]

      return !match
    })
  })

  return params
}
