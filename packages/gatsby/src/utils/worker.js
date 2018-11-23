const Promise = require(`bluebird`)

export function renderHTML({ htmlComponentRendererPath, paths, envVars }) {
  // This is being executed in child process, so we need to set some vars
  // for modules that aren't bundled by webpack.
  envVars.forEach(([key, value]) => (process.env[key] = value))

  return Promise.map(paths, async path => {
    const htmlComponentRenderer = require(htmlComponentRendererPath)
    return {
      path,
      ...(await htmlComponentRenderer.default(path)),
    }
  })
}
