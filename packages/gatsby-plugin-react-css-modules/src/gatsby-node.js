exports.modifyBabelrc = ({ babelrc }, { plugins, ...options }) => {
  return {
    ...babelrc,
    plugins: [
      ...(babelrc.plugins || []),
      [
        `react-css-modules`,
        {
          generateScopedName: `[name]--[local]--[hash:base64:5]`,
          webpackHotModuleReloading: process.env.NODE_ENV !== `production`,
          ...options,
        },
      ],
    ],
  }
}
