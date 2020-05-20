exports.onPreInit = () => {
  // Setting this variable replaces react-hot-loader with
  // [fast-refresh](https://reactnative.dev/docs/next/fast-refresh)
  // and resolves conflicts with running Preact in development.
  process.env.GATSBY_HOT_LOADER = `fast-refresh`
}

exports.onCreateWebpackConfig = ({ actions }) => {
  // React-dom is hardcoded as part of react-hot-loader
  // in the development server. So we either avoid Preact
  // during development or switch to fast-refresh and loose
  // hot reloading capabilities.
  actions.setWebpackConfig({
    resolve: {
      alias: {
        react: `preact/compat`,
        "react-dom": `preact/compat`,
        "react-dom/server": `preact/compat`,
      },
    },
  })
}
