const path = require(`path`)
const mdx = require(`../utils/mdx`)
const defaultOptions = require(`../utils/default-options`)

module.exports = async function preprocessSource(
  { filename, contents },
  pluginOptions
) {
  const { extensions, ...options } = defaultOptions(pluginOptions)
  const ext = path.extname(filename)

  if (extensions.includes(ext)) {
    const code = await mdx(contents, {
      filepath: filename,
      ...options,
    })
    return code
  }
  return null
}
