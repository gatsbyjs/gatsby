"use strict";

var _extractTextWebpackPlugin = require("extract-text-webpack-plugin");

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.modifyWebpackConfig = function (_ref, _ref2) {
  var config = _ref.config,
      stage = _ref.stage;
  var postCssPlugins = _ref2.postCssPlugins;

  var cssModulesConf = `css?modules&minimize&importLoaders=1`;
  var cssModulesConfDev = `${cssModulesConf}&sourceMap&localIdentName=[name]---[local]---[hash:base64:5]`;

  // Pass in plugins regardless of stage.
  // If none specified, fallback to Gatsby default postcss plugins.
  if (postCssPlugins) {
    config.merge(function (current) {
      current.postcss = postCssPlugins;
      return current;
    });
  }

  switch (stage) {
    case `develop`:
      {
        config.loader(`sass`, {
          test: /\.s(a|c)ss$/,
          exclude: /\.module\.s(a|c)ss$/,
          loaders: [`style`, `css`, `postcss`, `sass`]
        });

        config.loader(`sassModules`, {
          test: /\.module\.s(a|c)ss$/,
          loaders: [`style`, cssModulesConfDev, `postcss`, `sass`]
        });
        return config;
      }
    case `build-css`:
      {
        config.loader(`sass`, {
          test: /\.s(a|c)ss$/,
          exclude: /\.module\.s(a|c)ss$/,
          loader: _extractTextWebpackPlugin2.default.extract([`css?minimize`, `postcss`, `sass`])
        });

        config.loader(`sassModules`, {
          test: /\.module\.s(a|c)ss$/,
          loader: _extractTextWebpackPlugin2.default.extract(`style`, [cssModulesConf, `postcss`, `sass`])
        });
        return config;
      }
    case `develop-html`:
    case `build-html`:
      {
        config.loader(`sass`, {
          test: /\.s(a|c)ss$/,
          exclude: /\.module\.s(a|c)ss$/,
          loader: `null`
        });

        config.loader(`sassModules`, {
          test: /\.module\.s(a|c)ss$/,
          loader: _extractTextWebpackPlugin2.default.extract(`style`, [cssModulesConf, `postcss`, `sass`])
        });
        return config;
      }
    case `build-javascript`:
      {
        config.loader(`sass`, {
          test: /\.s(a|c)ss$/,
          exclude: /\.module\.s(a|c)ss$/,
          loader: `null`
        });

        config.loader(`sassModules`, {
          test: /\.module\.s(a|c)ss$/,
          loader: _extractTextWebpackPlugin2.default.extract(`style`, [cssModulesConf, `sass`])
        });
        return config;
      }
    default:
      {
        return config;
      }
  }
};