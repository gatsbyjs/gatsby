exports.rewritePath = function rewritePath (parsedPath) {
  if (parsedPath.name === `move-me`) {
    return `/moved/`
  } else {
    return undefined
  }
}
