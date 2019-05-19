export const onCreateBabelConfig = ({ actions }, pluginOptions) => {
  actions.setBabelPreset({
    name: `@babel/preset-flow`,
  })
}
