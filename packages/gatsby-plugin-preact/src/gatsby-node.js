exports.modifyWebpackConfig = ({ stage, boundActionCreators }) => {
  // Requiring the server version of React-dom is hardcoded right now
  // in the development server. So we'll just avoid loading Preact there
  // for now.
  if (stage !== `develop-html`) {
    boundActionCreators.setWebpackConfig({
      resolve: {
        alias: {
          react: `preact-compat`,
          "react-dom": `preact-compat`,
        },
      },
    })
  }
}
