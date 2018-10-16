exports.onCreateWebpackConfig = ({ stage, actions }) => {
  // Requiring the server version of React-dom is hardcoded right now
  // in the development server. So we'll just avoid loading Inferno there
  // for now.
  if (stage !== `develop-html`) {
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
