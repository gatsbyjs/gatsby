import { LOCAL_IDENT_NAME } from "gatsby-1-config-css-modules"

exports.modifyBabelrc = ({ babelrc }, { plugins, ...options }) => {
  return {
    ...babelrc,
    plugins: [
      ...(babelrc.plugins || []),
      [
        `react-css-modules`,
        {
          generateScopedName: LOCAL_IDENT_NAME,
          webpackHotModuleReloading: process.env.NODE_ENV !== `production`,
          ...options,
        },
      ],
    ],
  }
}
