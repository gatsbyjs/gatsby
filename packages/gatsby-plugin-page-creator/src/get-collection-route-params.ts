// This extracts params from its filePath counerpart
// and returns an object of it's matches.
// e.g.,
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

    const key = part
      .replace(`{`, ``) // remove opening character
      .replace(/([a-zA-Z]+)\./, ``) // remove model
      .replace(`}`, ``) // remove closing character
      .replace(/\.[a-z]+$/, ``) // remove optional file extension

    params[key] = urlParts[i]
  })

  return params
}
