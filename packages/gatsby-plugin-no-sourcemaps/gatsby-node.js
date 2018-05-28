exports.modifyWebpackConfig = ({ config, stage }) => {
  if (stage === 'build-javascript') {
    config._config.devtool = false;
  }
};
