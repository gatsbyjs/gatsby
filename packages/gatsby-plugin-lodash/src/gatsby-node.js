const webpackLodashPlugin = require(`lodash-webpack-plugin`)

// Add Lodash webpack plugin
exports.onCreateWebpackConfig = (
  { actions, stage },
  { disabledFeatures = [] }
) => {
  if (stage !== `build-javascript`) return

  const features = {
    shorthands: true,
    cloning: true,
    currying: true,
    caching: true,
    collections: true,
    exotics: true,
    guards: true,
    metadata: true,
    deburring: true,
    unicode: true,
    chaining: true,
    memoizing: true,
    coercions: true,
    flattening: true,
    paths: true,
    placeholders: true,
  }

  disabledFeatures.forEach(feature => {
    delete features[feature]
  })

  actions.setWebpackConfig({
    plugins: [new webpackLodashPlugin(features)],
  })
}

// Add Lodash Babel plugin
exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelPlugin({
    name: require.resolve(`@sigmacomputing/babel-plugin-lodash`),
  })
}
