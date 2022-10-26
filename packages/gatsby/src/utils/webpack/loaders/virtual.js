const Template = require(`webpack/lib/Template`)

module.exports = async function virtual(source, sourceMap) {
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
