"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createClientOnlyPage = createClientOnlyPage;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _gatsbyPageUtils = require("gatsby-page-utils");

var _getMatchPath = require("./get-match-path");

function createClientOnlyPage(filePath, absolutePath, actions) {
  // Create page object
  var createdPath = (0, _gatsbyPageUtils.createPath)(filePath);
  var page = (0, _extends2.default)({
    path: createdPath
  }, (0, _getMatchPath.getMatchPath)(createdPath), {
    component: absolutePath,
    context: {}
  }); // Add page

  actions.createPage(page);
}