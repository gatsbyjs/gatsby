"use strict";

var ExtractTextPlugin = require(`extract-text-webpack-plugin`);

var _require = require(`gatsby-1-config-css-modules`),
    cssModulesConfig = _require.cssModulesConfig;

exports.modifyWebpackConfig = function (_ref, options) {
  var config = _ref.config,
      stage = _ref.stage;

  // Pass in plugins regardless of stage.
  // If none specified, fallback to Gatsby default postcss plugins.
  if (options.postCssPlugins) {
    config.merge(function (current) {
      current.postcss = options.postCssPlugins;
      return current;
    });
  }

  var sassFiles = /\.s[ac]ss$/;
  var sassModulesFiles = /\.module\.s[ac]ss$/;
  var sassLoader = `sass?${JSON.stringify(options)}`;

  switch (stage) {
    case `develop`:
      {
        config.loader(`sass`, {
          test: sassFiles,
          exclude: sassModulesFiles,
          loaders: [`style`, `css`, `postcss`, sassLoader]
        });

        config.loader(`sassModules`, {
          test: sassModulesFiles,
          loaders: [`style`, cssModulesConfig(stage), `postcss`, sassLoader]
        });
        return config;
      }
    case `build-css`:
      {
        config.loader(`sass`, {
          test: sassFiles,
          exclude: sassModulesFiles,
          loader: ExtractTextPlugin.extract([`css?minimize`, `postcss`, sassLoader])
        });

        config.loader(`sassModules`, {
          test: sassModulesFiles,
          loader: ExtractTextPlugin.extract(`style`, [cssModulesConfig(stage), `postcss`, sassLoader])
        });
        return config;
      }
    case `develop-html`:
    case `build-html`:
      {
        config.loader(`sass`, {
          test: sassFiles,
          exclude: sassModulesFiles,
          loader: `null`
        });

        config.loader(`sassModules`, {
          test: sassModulesFiles,
          loader: ExtractTextPlugin.extract(`style`, [cssModulesConfig(stage), `postcss`, sassLoader])
        });
        return config;
      }
    case `build-javascript`:
      {
        config.loader(`sass`, {
          test: sassFiles,
          exclude: sassModulesFiles,
          loader: `null`
        });

        config.loader(`sassModules`, {
          test: sassModulesFiles,
          loader: ExtractTextPlugin.extract(`style`, [cssModulesConfig(stage), sassLoader])
        });
        return config;
      }
    default:
      {
        return config;
      }
  }
};