// This extracts params from its matchPath counerpart
// and returns an object of it's matches.
// e.g.,
//   /foo/:id, /foo/123 => {id: 123}
export function getParams(
  matchPath: string,
  realPath: string
): Record<string, string> {
  const params = {}
  // remove the starting path to simplify the loop
  const matchParts = matchPath.split(`/`)
  const realParts = realPath.split(`/`)

  matchParts.forEach((part, i) => {
    if (!part.startsWith(`:`)) return

    const key = part.replace(`:`, ``)
    params[key] = realParts[i]
  })

  return params
}
