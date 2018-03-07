exports.onCreateWebpackConfig = ({ stage, actions }) => {
  // Requiring the server version of React-dom is hardcoded right now
  // in the development server. So we'll just avoid loading Preact there
  // for now.
  if (stage !== `develop-html`) {
    actions.setWebpackConfig({
      resolve: {
        alias: {
          react: `preact-compat`,
          "react-dom": `preact-compat`,
          "create-react-class": `preact-compat/lib/create-react-class`,
        },
      },
    })
  }
}
