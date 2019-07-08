const transformWebpackError = (stage, webpackError) => {
  // console.log(__filename, { stage, e })

  let filePath = webpackError?.module?.resource
  const e2 = {
    id: `98123`,
    filePath: webpackError?.module?.resource,
    location: webpackError?.error?.loc
      ? {
          start: webpackError.error.loc,
        }
      : null,
    context: {
      stage,
    },
  }
  return e2
  // return e
}

module.exports = (stage, webpackError) => {
  if (Array.isArray(webpackError)) {
    return webpackError.map(e => transformWebpackError(stage, e))
  }

  return transformWebpackError(stage, webpackError)
}
