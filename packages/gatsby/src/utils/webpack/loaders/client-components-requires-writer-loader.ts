import { LoaderContext } from "webpack"

const Template = require(`webpack/lib/Template`)

/**
 * Loader that creates virtual file with imports to client components
 */
module.exports = function virtual(
  this: LoaderContext<{
    modules: string
  }>
): string {
  const { modules } = this.getOptions()

  const requests = modules.split(`,`)

  const code = requests
    .filter(Boolean)
    // Filter out css files on the server
    .map(request => {
      const chunkName = Template.toPath(request)

      return `import(/* webpackChunkName: "${chunkName}" */ ${JSON.stringify(
        request
      )})`
    })
    .join(`;\n`)

  return code
}
