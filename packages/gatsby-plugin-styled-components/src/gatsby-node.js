// Add Babel plugin
let babelPluginExists = false
try {
  require.resolve(`babel-plugin-styled-components`)
  babelPluginExists = true
} catch (e) {
  throw new Error(`'babel-plugin-styled-components' is not installed`)
}

exports.onCreateBabelConfig = ({ stage, actions }) => {
  if (!babelPluginExists) return

  actions.setBabelPlugin({
    name: `babel-plugin-styled-components`,
    stage,
    options: { ssr: stage === `build-html` },
  })
}
