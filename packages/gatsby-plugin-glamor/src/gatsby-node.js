
// Add Glamor support
exports.modifyWebpackConfig = ({ boundActionCreators, plugins }) =>
  boundActionCreators.setWebpackConfig({
    plugins: [
      plugins.provide({
        Glamor: `glamor/react`,
      }),
    ],
  })


// Add Glamor support
exports.modifyBabelrc = ({ babelrc }) => {
  return {
    ...babelrc,
    plugins: babelrc.plugins.concat([
      [`transform-react-jsx`, { pragma: `Glamor.createElement` }],
      `glamor/babel-hoist`,
    ]),
  }
}
