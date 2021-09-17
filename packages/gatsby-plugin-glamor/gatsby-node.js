"use strict";

// Add Glamor support
exports.onCreateWebpackConfig = function (_ref) {
  var actions = _ref.actions,
      plugins = _ref.plugins;
  return actions.setWebpackConfig({
    plugins: [plugins.provide({
      Glamor: "glamor/react"
    })]
  });
}; // Add Glamor babel plugin


exports.onCreateBabelConfig = function (_ref2) {
  var actions = _ref2.actions;
  actions.setBabelPlugin({
    name: require.resolve("glamor/babel-hoist")
  });
  actions.setBabelPreset({
    name: require.resolve("@babel/preset-react"),
    options: {
      pragma: "Glamor.createElement"
    }
  });
};

exports.pluginOptionsSchema = function (_ref3) {
  var Joi = _ref3.Joi;
  return Joi.object({});
};