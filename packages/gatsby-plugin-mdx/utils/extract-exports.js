const babel = require(`@babel/core`)
const babelReact = require(`@babel/preset-react`)
const objRestSpread = require(`@babel/plugin-proposal-object-rest-spread`)
const BabelPluginGatherExports = require(`./babel-plugin-gather-exports`)

// grab all the export values
module.exports = (code, filename) => {
  const instance = new BabelPluginGatherExports()
  babel.transform(code, {
    // Note: filename is a mandatory field
    filename,
    presets: [babelReact],
    plugins: [instance.plugin, objRestSpread],
  })

  const exportedVariables = instance.state.exports

  // grab the frontmatter
  const {
    _frontmatter: classicFrontmatter = {},
    frontmatter: exportFrontmatter = {},
    ...newExportedVariables
  } = exportedVariables

  // add the merged frontmatter to the exports
  newExportedVariables.frontmatter = {
    ...classicFrontmatter,
    ...exportFrontmatter,
  }

  return newExportedVariables
}
