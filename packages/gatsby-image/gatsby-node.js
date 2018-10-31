exports.onCreateWebpackConfig = ({ actions, plugins }, { loadPolyfills = false }) => {
  actions.setWebpackConfig({
    plugins: [
      plugins.define({
        GATSBY_IMAGE_LOAD_POLYFILLS: JSON.stringify(loadPolyfills),
      }),
    ],
  })
}