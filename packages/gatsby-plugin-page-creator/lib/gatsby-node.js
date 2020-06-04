"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var globCB = require("glob");

var Promise = require("bluebird");

var _ = require("lodash");

var systemPath = require("path");

var existsSync = require("fs-exists-cached").sync;

var glob = Promise.promisify(globCB);

var _require = require("./create-page-wrapper"),
    createPage = _require.createPage;

var _require2 = require("gatsby-page-utils"),
    createPath = _require2.createPath,
    watchDirectory = _require2.watchDirectory; // Path creator.
// Auto-create pages.
// algorithm is glob /pages directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that page component in gatsby-node.


exports.createPagesStatefully = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(_ref, _ref2, doneCb) {
    var store, actions, reporter, graphql, pagesPath, _ref2$pathCheck, pathCheck, ignore, deletePage, _store$getState, program, exts, pagesDirectory, pagesGlob, files;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            store = _ref.store, actions = _ref.actions, reporter = _ref.reporter, graphql = _ref.graphql;
            pagesPath = _ref2.path, _ref2$pathCheck = _ref2.pathCheck, pathCheck = _ref2$pathCheck === void 0 ? true : _ref2$pathCheck, ignore = _ref2.ignore;
            deletePage = actions.deletePage;
            _store$getState = store.getState(), program = _store$getState.program;
            exts = program.extensions.map(function (e) {
              return "" + e.slice(1);
            }).join(",");

            if (!pagesPath) {
              reporter.panic("\n      \"path\" is a required option for gatsby-plugin-page-creator\n\n      See docs here - https://www.gatsbyjs.org/plugins/gatsby-plugin-page-creator/\n      ");
            } // Validate that the path exists.


            if (pathCheck && !existsSync(pagesPath)) {
              reporter.panic("\n      The path passed to gatsby-plugin-page-creator does not exist on your file system:\n\n      " + pagesPath + "\n\n      Please pick a path to an existing directory.\n      ");
            }

            pagesDirectory = systemPath.resolve(process.cwd(), pagesPath);
            pagesGlob = "**/*.{" + exts + "}"; // Get initial list of files.

            _context.next = 11;
            return glob(pagesGlob, {
              cwd: pagesPath
            });

          case 11:
            files = _context.sent;
            files.forEach(function (file) {
              createPage(file, pagesDirectory, actions, ignore, graphql);
            });
            watchDirectory(pagesPath, pagesGlob, function (addedPath) {
              if (!_.includes(files, addedPath)) {
                createPage(addedPath, pagesDirectory, actions, ignore, graphql);
                files.push(addedPath);
              }
            }, function (removedPath) {
              // Delete the page for the now deleted component.
              var componentPath = systemPath.join(pagesDirectory, removedPath);
              store.getState().pages.forEach(function (page) {
                if (page.component === componentPath) {
                  deletePage({
                    path: createPath(removedPath),
                    component: componentPath
                  });
                }
              });
              files = files.filter(function (f) {
                return f !== removedPath;
              });
            }).then(function () {
              return doneCb();
            });

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2, _x3) {
    return _ref3.apply(this, arguments);
  };
}();