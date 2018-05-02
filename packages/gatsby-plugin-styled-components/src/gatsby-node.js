// Add Babel plugin
try {
  require.resolve(`babel-plugin-styled-components`)
} catch (e) {
  throw new Error(
    `'babel-plugin-styled-components' is not installed which is needed by plugin 'gatsby-plugin-styled-components'`
  )
}

exports.onCreateBabelConfig = ({ stage, actions }) => {
  actions.setBabelPlugin({
    name: `babel-plugin-styled-components`,
    stage,
    options: { ssr: stage === `build-html` },
  })
}
