exports.getParams = function getParams(matchPath, realPath) {
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
