"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _extractQuery = require("./extract-query");

var _getMatchPath = require("./get-match-path");

var _gatsbyPageUtils = require("gatsby-page-utils");

var _getParams = require("./get-params");

var _babelParseToAst = require("gatsby/dist/utils/babel-parse-to-ast");

var _derivePath = require("./derive-path");

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _traverse = _interopRequireDefault(require("@babel/traverse"));

var t = _interopRequireWildcard(require("@babel/types"));

// Move this to gatsby-core-utils?
// Changes something like
//   `/Users/site/src/pages/foo/{id}/`
// to
//   `/foo/:id`
function translateInterpolationToMatchPath(createdPath) {
  var _createdPath$split = createdPath.split("src/pages"),
      path = _createdPath$split[1];

  return path.replace("{", ":").replace("}", "").replace(/\/$/, "");
}

function isCreatePagesFromData(path) {
  var callee = path.get("callee").get("object");
  return path.node.callee.type === "MemberExpression" && path.node.callee.property.name === "createPagesFromData" && Array.isArray(callee) && callee[0].referencesImport("gatsby", "createPagesFromData") || callee.referencesImport("gatsby", "createPagesFromData");
} // TODO: Do we need the ignore argument?


exports.createPagesFromCollectionBuilder = /*#__PURE__*/function () {
  var _createPagesFromCollectionBuilder = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(absolutePath, actions, graphql) {
    var _absolutePath$split, route, ast, queryString, _yield$graphql, data, errors, rootKey, nodes;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _absolutePath$split = absolutePath.split("src/pages"), route = _absolutePath$split[1];
            ast = (0, _babelParseToAst.babelParseToAst)(_fsExtra.default.readFileSync(absolutePath).toString(), absolutePath);
            queryString = "";
            (0, _traverse.default)(ast, {
              // TODO: Throw an error if this is not the export default ? just to encourage default habits
              CallExpression: function CallExpression(path) {
                if (!isCreatePagesFromData(path)) return;
                if (!t.isCallExpression(path)) return; // this might not be needed...

                var _path$node$arguments = path.node.arguments,
                    queryAst = _path$node$arguments[1];
                var string = "";

                if (t.isTemplateLiteral(queryAst)) {
                  string = queryAst.quasis[0].value.raw;
                }

                if (t.isStringLiteral(queryAst)) {
                  string = queryAst.value;
                }

                queryString = (0, _extractQuery.generateQueryFromString)(string, absolutePath);
              }
            });
            _context.next = 6;
            return graphql(queryString);

          case 6:
            _yield$graphql = _context.sent;
            data = _yield$graphql.data;
            errors = _yield$graphql.errors;

            if (!(!data || errors)) {
              _context.next = 13;
              break;
            }

            console.warn("Tried to create pages from the collection builder found at " + route + ".\nUnfortunately, the query came back empty. There may be an error in your query.");
            console.error(errors);
            return _context.abrupt("return");

          case 13:
            rootKey = /^\{([a-zA-Z]+)/.exec(queryString);

            if (!(!rootKey || !rootKey[0])) {
              _context.next = 16;
              break;
            }

            throw new Error("An internal error occured, if you experience this please an open an issue. Problem: Couldn't resolve the graphql keys in collection builder");

          case 16:
            nodes = data[rootKey[0]].nodes;

            if (nodes) {
              console.log(">>>> Creating " + nodes.length + " pages from " + route);
            }

            nodes.forEach(function (node) {
              var matchPath = translateInterpolationToMatchPath((0, _gatsbyPageUtils.createPath)(absolutePath));
              var path = (0, _gatsbyPageUtils.createPath)((0, _derivePath.derivePath)(absolutePath, node));
              var params = (0, _getParams.getParams)(matchPath, path);
              var nodeParams = (0, _extractQuery.reverseLookupParams)(node, absolutePath);
              actions.createPage((0, _extends2.default)({
                path: path
              }, (0, _getMatchPath.getMatchPath)(path), {
                component: absolutePath,
                context: (0, _extends2.default)({}, nodeParams, {
                  __params: params
                })
              }));
            });

          case 19:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  function createPagesFromCollectionBuilder(_x, _x2, _x3) {
    return _createPagesFromCollectionBuilder.apply(this, arguments);
  }

  return createPagesFromCollectionBuilder;
}();