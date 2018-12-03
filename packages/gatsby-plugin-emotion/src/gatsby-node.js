export const onCreateBabelConfig = ({ actions }, pluginOptions) => {
  const pragmaName = `___EmotionJSX`

  actions.setBabelPlugin({
    name: `babel-plugin-jsx-pragmatic`,
    options: {
      export: `jsx`,
      module: `@emotion/core`,
      import: pragmaName,
    },
  })

  actions.setBabelPlugin({
    name: `@babel/plugin-transform-react-jsx`,
    options: {
      pragma: pragmaName,
    },
  })

  actions.setBabelPlugin({
    name: `babel-plugin-emotion`,
    options: {
      cssPropOptimization: true,
      sourceMap: process.env.NODE_ENV !== `production`,
      autoLabel: process.env.NODE_ENV !== `production`,
      ...(pluginOptions ? pluginOptions : {}),
    },
  })
}
