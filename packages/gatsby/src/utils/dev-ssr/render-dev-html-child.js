import { parseError } from "./parse-error"

exports.renderHTML = async ({
  path,
  componentPath,
  htmlComponentRendererPath,
  publicDir,
  isClientOnlyPage = false,
  error = undefined,
  directory,
  serverData,
}) => {
  try {
    const htmlComponentRenderer = require(htmlComponentRendererPath)
    if (process.env.GATSBY_EXPERIMENTAL_DEV_SSR) {
      return await htmlComponentRenderer.default({
        pagePath: path,
        isClientOnlyPage,
        publicDir,
        error,
        serverData,
      })
    } else {
      return await htmlComponentRenderer.default({
        pagePath: path,
        publicDir,
        isClientOnlyPage: true,
      })
    }
  } catch (err) {
    const error = parseError({ err, directory, componentPath })
    throw error
  }
}
exports.deleteModuleCache = htmlComponentRendererPath => {
  delete require.cache[require.resolve(htmlComponentRendererPath)]
}
