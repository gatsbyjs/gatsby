export const onCreateBabelConfig = ({ actions }, pluginOptions) => {
  const options = pluginOptions || {}
  // eslint-disable-next-line no-unused-vars
  const { useExtractCritialSSR, ...babelPluginOptions } = options

  actions.setBabelPreset({
    name: require.resolve(`@emotion/babel-preset-css-prop`),
    options: {
      sourceMap: process.env.NODE_ENV !== `production`,
      autoLabel: process.env.NODE_ENV !== `production`,
      ...(babelPluginOptions ? babelPluginOptions : {}),
    },
  })
}
