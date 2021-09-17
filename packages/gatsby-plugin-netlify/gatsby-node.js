"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _webpackAssetsManifest = _interopRequireDefault(require("webpack-assets-manifest"));

var _pluginData = _interopRequireDefault(require("./plugin-data"));

var _buildHeadersProgram = _interopRequireDefault(require("./build-headers-program"));

var _createRedirects = _interopRequireDefault(require("./create-redirects"));

var _constants = require("./constants");

// https://www.netlify.com/docs/headers-and-basic-auth/
const assetsManifest = {}; // Inject a webpack plugin to get the file manifests so we can translate all link headers

exports.onCreateWebpackConfig = ({
  actions,
  stage
}) => {
  if (stage !== _constants.BUILD_HTML_STAGE && stage !== _constants.BUILD_CSS_STAGE) {
    return;
  }

  actions.setWebpackConfig({
    plugins: [new _webpackAssetsManifest.default({
      assets: assetsManifest,
      // mutates object with entries
      merge: true
    })]
  });
};

exports.onPostBuild = async ({
  store,
  pathPrefix,
  reporter
}, userPluginOptions) => {
  const pluginData = (0, _pluginData.default)(store, assetsManifest, pathPrefix);
  const pluginOptions = { ..._constants.DEFAULT_OPTIONS,
    ...userPluginOptions
  };
  const {
    redirects
  } = store.getState();
  let rewrites = [];

  if (pluginOptions.generateMatchPathRewrites) {
    const {
      pages
    } = store.getState();
    rewrites = Array.from(pages.values()).filter(page => page.matchPath && page.matchPath !== page.path).map(page => {
      return {
        fromPath: page.matchPath,
        toPath: page.path
      };
    });
  }

  await Promise.all([(0, _buildHeadersProgram.default)(pluginData, pluginOptions, reporter), (0, _createRedirects.default)(pluginData, redirects, rewrites)]);
};

const MATCH_ALL_KEYS = /^/;

const pluginOptionsSchema = function ({
  Joi
}) {
  // headers is a specific type used by Netlify: https://www.gatsbyjs.com/plugins/gatsby-plugin-netlify/#headers
  const headersSchema = Joi.object().pattern(MATCH_ALL_KEYS, Joi.array().items(Joi.string())).description(`Add more Netlify headers to specific pages`);
  return Joi.object({
    headers: headersSchema,
    allPageHeaders: Joi.array().items(Joi.string()).description(`Add more headers to all the pages`),
    mergeSecurityHeaders: Joi.boolean().description(`When set to true, turns off the default security headers`),
    mergeLinkHeaders: Joi.boolean().description(`When set to true, turns off the default gatsby js headers`),
    mergeCachingHeaders: Joi.boolean().description(`When set to true, turns off the default caching headers`),
    transformHeaders: Joi.function().maxArity(2).description(`Transform function for manipulating headers under each path (e.g.sorting), etc. This should return an object of type: { key: Array<string> }`),
    generateMatchPathRewrites: Joi.boolean().description(`When set to true, turns off automatic creation of redirect rules for client only paths`)
  });
};

exports.pluginOptionsSchema = pluginOptionsSchema;