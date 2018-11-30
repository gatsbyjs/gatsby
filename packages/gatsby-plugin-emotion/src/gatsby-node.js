exports.onCreateBabelConfig = ({ actions, stage }, pluginOptions) => {
  actions.setBabelPreset({
    name: `@babel/preset-react`,
    stage,
    options: {
      useBuiltIns: true,
      pragma: `___EmotionJSX`,
      development: stage === `develop`,
    },
  })

  actions.setBabelPlugin({
    name: `babel-plugin-jsx-pragmatic`,
    stage,
    options: {
      export: `jsx`,
      module: `@emotion/core`,
      import: `___EmotionJSX`,
    },
  })

  actions.setBabelPlugin({
    name: `babel-plugin-emotion`,
    stage,
    options: {
      cssPropOptimization: true,
      sourceMap: process.env.NODE_ENV !== `production`,
      autoLabel: process.env.NODE_ENV !== `production`,
      ...(pluginOptions ? pluginOptions : {}),
    },
  })
}
