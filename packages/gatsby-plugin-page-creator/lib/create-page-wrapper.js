"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createPage = createPage;

var _gatsbyPageUtils = require("gatsby-page-utils");

var _createClientOnlyPage = require("./create-client-only-page");

var _createPagesFromCollectionBuilder = require("./create-pages-from-collection-builder");

var _path = _interopRequireDefault(require("path"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

function pathIsCCollectionBuilder(path) {
  if (_fsExtra.default.existsSync(path) === false) return false;

  var js = _fsExtra.default.readFileSync(path).toString();

  return js.includes("createPagesFromData");
}

function pathIsClientOnlyRoute(path) {
  return path.includes("[");
}

function createPage(filePath, pagesDirectory, actions, ignore, graphql) {
  // Filter out special components that shouldn't be made into
  // pages.
  if (!(0, _gatsbyPageUtils.validatePath)(filePath)) {
    console.log(1, filePath);
    return;
  } // Filter out anything matching the given ignore patterns and options


  if ((0, _gatsbyPageUtils.ignorePath)(filePath, ignore)) {
    console.log(2, filePath);
    return;
  }

  var absolutePath = _path.default.join(pagesDirectory, filePath);

  if (pathIsCCollectionBuilder(absolutePath)) {
    console.log(3, absolutePath);
    (0, _createPagesFromCollectionBuilder.createPagesFromCollectionBuilder)(absolutePath, actions, graphql);
    return;
  }

  if (pathIsClientOnlyRoute(absolutePath)) {
    console.log(4, absolutePath);
    (0, _createClientOnlyPage.createClientOnlyPage)(filePath, absolutePath, actions);
    return;
  }

  console.log(5, filePath); // Create page object

  var createdPath = (0, _gatsbyPageUtils.createPath)(filePath);
  var page = {
    path: createdPath,
    component: absolutePath,
    context: {}
  }; // Add page

  actions.createPage(page);
}