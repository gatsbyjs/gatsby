"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.onPreBootstrap = onPreBootstrap;
exports.onCreateDevServer = onCreateDevServer;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _fsExtra = _interopRequireDefault(require("fs-extra"));

var _globby = _interopRequireDefault(require("globby"));

var _path = _interopRequireDefault(require("path"));

var _webpack = _interopRequireDefault(require("webpack"));

var _multer = _interopRequireDefault(require("multer"));

var express = _interopRequireWildcard(require("express"));

var _gatsbyCoreUtils = require("gatsby-core-utils");

var DEFAULT_FUNCTIONS_DIRECTORY_PATH = _path.default.join(process.cwd(), "src/api");

function onPreBootstrap(_x, _x2) {
  return _onPreBootstrap.apply(this, arguments);
}

function _onPreBootstrap() {
  _onPreBootstrap = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee(_ref, _ref2) {
    var reporter, _ref2$path, functionsDirectoryPath, activity, functionsDirectory, functionsGlob, files, knownFunctions, gatsbyVarObject, varObject;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            reporter = _ref.reporter;
            _ref2$path = _ref2.path, functionsDirectoryPath = _ref2$path === void 0 ? DEFAULT_FUNCTIONS_DIRECTORY_PATH : _ref2$path;
            activity = reporter.activityTimer("building functions");
            activity.start();
            functionsDirectory = _path.default.resolve(process.cwd(), functionsDirectoryPath);
            functionsGlob = "**/*.{js,ts}"; // Get initial list of files

            _context.next = 8;
            return (0, _globby.default)(functionsGlob, {
              cwd: functionsDirectory
            });

          case 8:
            files = _context.sent;
            // console.log({ files })
            knownFunctions = new Set(files); // console.log({ knownFunctions })
            // if (![`develop`, `build-javascript`].includes(stage)) {
            //   return Promise.resolve()
            // }

            _context.next = 12;
            return _fsExtra.default.ensureDir(_path.default.join(process.cwd(), ".cache", "functions"));

          case 12:
            _context.next = 14;
            return _fsExtra.default.emptyDir(_path.default.join(process.cwd(), ".cache", "functions"));

          case 14:
            // console.log({
            //   path: path.join(functionsDirectory, `month.js`),
            // })
            gatsbyVarObject = Object.keys(process.env).reduce(function (acc, key) {
              if (key.match(/^GATSBY_/)) {
                acc[key] = JSON.stringify(process.env[key]);
              }

              return acc;
            }, {});
            varObject = Object.keys(gatsbyVarObject).reduce(function (acc, key) {
              acc["process.env." + key] = gatsbyVarObject[key];
              return acc;
            }, {
              "process.env": "({})"
            });
            _context.next = 18;
            return Promise.all(files.map(function (file) {
              var config = {
                entry: _path.default.join(functionsDirectory, file),
                output: {
                  path: _path.default.join(process.cwd(), ".cache", "functions"),
                  filename: file.replace(".ts", ".js"),
                  libraryTarget: "commonjs2"
                },
                target: "node",
                // library: "yourLibName",
                mode: "production",
                module: {
                  rules: [{
                    test: [/.js$/, /.ts$/],
                    exclude: /node_modules/,
                    loader: "babel-loader"
                  }]
                },
                plugins: [new _webpack.default.DefinePlugin(varObject)] // devtool: `source-map`,

              };
              return new Promise(function (resolve, reject) {
                return (// if (stage === `develop`) {
                  //   webpack(config).watch({}, () => {})
                  //   return resolve()
                  // }
                  (0, _webpack.default)(config).run(function (err, stats) {
                    console.log({
                      warnings: stats.compilation.warnings
                    });
                    if (err) return reject(err);
                    var errors = stats.compilation.errors || [];
                    if (errors.length > 0) return reject(stats.compilation.errors);
                    return resolve();
                  })
                );
              });
            }));

          case 18:
            activity.end();

          case 19:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _onPreBootstrap.apply(this, arguments);
}

function onCreateDevServer(_x3, _x4) {
  return _onCreateDevServer.apply(this, arguments);
}

function _onCreateDevServer() {
  _onCreateDevServer = (0, _asyncToGenerator2.default)( /*#__PURE__*/_regenerator.default.mark(function _callee2(_ref3, _ref4) {
    var reporter, app, _ref4$path, functionsDirectoryPath, functionsGlob, functionsDirectory, files, knownFunctions;

    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            reporter = _ref3.reporter, app = _ref3.app;
            _ref4$path = _ref4.path, functionsDirectoryPath = _ref4$path === void 0 ? DEFAULT_FUNCTIONS_DIRECTORY_PATH : _ref4$path;
            functionsGlob = "**/*.{js,ts}";
            functionsDirectory = _path.default.resolve(process.cwd(), functionsDirectoryPath);
            _context2.next = 6;
            return (0, _globby.default)(functionsGlob, {
              cwd: functionsDirectory
            });

          case 6:
            files = _context2.sent;
            // console.log({ files })
            knownFunctions = new Map(files.map(function (file) {
              return [(0, _gatsbyCoreUtils.urlResolve)(_path.default.parse(file).dir, _path.default.parse(file).name), file];
            })); // console.log(app, functionsDirectoryPath)

            app.use("/api/:functionName", (0, _multer.default)().none(), express.urlencoded({
              extended: true
            }), express.text(), express.json(), express.raw(), function (req, res, next) {
              var functionName = req.params.functionName;

              if (knownFunctions.has(functionName)) {
                var fn = require(_path.default.join(functionsDirectory, knownFunctions.get(functionName)));

                fn(req, res);
              } else {
                next();
              }
            });

          case 9:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _onCreateDevServer.apply(this, arguments);
}