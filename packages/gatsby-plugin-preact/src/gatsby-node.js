exports.onCreateWebpackConfig = ({ actions, stage }) => {
  // React-dom is hardcoded as part of react-hot-loader
  // in the development server. So we either avoid Preact
  // during development or switch to fast-refresh and loose
  // hot reloading capabilities.
  if (stage !== `develop` || process.env.GATSBY_HOT_LOADER === `fast-refresh`) {
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
}
