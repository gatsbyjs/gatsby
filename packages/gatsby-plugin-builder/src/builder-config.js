const invariant = require('invariant');

module.exports.defaultOptions = {
  // Arbitrary name for the remote schema Query type
  fieldName: 'allBuilderModels',
  typeName: 'builder'
};

module.exports.getGQLOptions = options => {
  let config = {
    ...module.exports.defaultOptions,
    ...options
  };
  invariant(
    config.publicAPIKey && config.publicAPIKey.length > 0,
    'gatsby-plugin-builder requires a public API Key'
  );
  return {
    typeName: config.typeName,
    // Field under which the remote schema will be accessible. You'll use this in your Gatsby query
    fieldName: config.fieldName,
    // Url to query from 30
    url: `https://cdn.builder.io/api/v1/graphql/${config.publicAPIKey}`
  };
};
