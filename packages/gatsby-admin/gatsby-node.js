exports.onCreateWebpackConfig = ({ actions }) => {
    actions.setWebpackConfig({
      resolve: {
        alias: {
          path: require.resolve("path-browserify")
        }
      }
    })
  }
