exports.onCreateWebpackConfig = ({ stage, actions }) => {
  /*
   * Inferno doesn't currently support Hot Module Reloading
   * in development mode, so we'll exclude it from the process then
   */
  if (stage !== `develop-html` && stage !== `develop`) {
    actions.setWebpackConfig({
      resolve: {
        alias: {
          react: `inferno-compat`,
          "react-dom": `inferno-compat`,
        },
      },
    })
  }
}
