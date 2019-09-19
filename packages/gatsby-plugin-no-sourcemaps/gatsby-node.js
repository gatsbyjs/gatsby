exports.onCreateWebpackConfig = ({ stage, actions }) => {
  if (stage === `build-javascript`) {
    actions.setWebpackConfig({
      devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
    });
  }
}
