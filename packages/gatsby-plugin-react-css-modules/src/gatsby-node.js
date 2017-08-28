import {
  isProduction,
  getLocalIdentName,
} from "gatsby/dist/utils/css-modules-config"

exports.modifyBabelrc = ({ babelrc }, { plugins, ...options }) => {
  return {
    ...babelrc,
    plugins: [
      ...(babelrc.plugins || []),
      [
        `react-css-modules`,
        {
          generateScopedName: getLocalIdentName(),
          webpackHotModuleReloading: !isProduction(),
          ...options,
        },
      ],
    ],
  }
}
