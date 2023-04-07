exports.onCreateWebpackConfig = ({ actions }) => {
  // Turn off polyfills for the large library we are importing in dummy.js so build is successful.  Not relevant to overall purpose of the example.
  actions.setWebpackConfig({
    resolve: {
      fallback: {
        stream: false,
        http: false,
      },
    },
  })
}
