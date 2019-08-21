export const onCreateBabelConfig = ({ actions }, pluginOptions) => {
  actions.setBabelPreset({
    name: require.resolve(`@babel/preset-flow`),
  })
}
