export const onCreateBabelConfig = ({ actions }, pluginOptions) => {
  actions.setBabelPreset({
    name: `@emotion/babel-preset-css-prop`,
    options: {
      sourceMap: process.env.NODE_ENV !== `production`,
      autoLabel: process.env.NODE_ENV !== `production`,
      ...(pluginOptions ? pluginOptions : {}),
    },
  })
}
