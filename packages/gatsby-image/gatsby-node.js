exports.onCreateWebpackConfig = ({ actions, plugins }, { loadPolyfills = false }) => {
  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        "process.env.GATSBY_IMAGE_LOAD_POLYFILLS": JSON.stringify(loadPolyfills),
      }),
    ],
  })
}