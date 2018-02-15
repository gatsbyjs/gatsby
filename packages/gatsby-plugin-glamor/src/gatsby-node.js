// Add Glamor support
exports.modifyWebpackConfig = ({ actions, plugins }) =>
  actions.setWebpackConfig({
    plugins: [
      plugins.provide({
        Glamor: `glamor/react`,
      }),
    ],
  })

// Add Glamor support
exports.modifyBabelrc = ({ babelrc }) => {
  const clonedPresets = [...babelrc.presets]
  clonedPresets.find(pre =>
    /babel\/preset-react/.test(pre[0])
  )[1].pragma = `Glamor.createElement`

  return {
    ...babelrc,
    presets: clonedPresets,
    plugins: babelrc.plugins.concat([
      [`transform-react-jsx`, { pragma: `Glamor.createElement` }],
      `glamor/babel-hoist`,
    ]),
  }
}
