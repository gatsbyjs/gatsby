"use strict";

exports.__esModule = true;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _constants = require("./constants");

var _fsExtra = require("fs-extra");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(pluginData, redirects) {
    var publicFolder, FILE_PATH, appendToFile, fileExists, fileContents, data;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            publicFolder = pluginData.publicFolder;

            if (redirects.length) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", null);

          case 3:
            FILE_PATH = publicFolder(`_redirects`);

            // Map redirect data to the format Netlify expects
            // https://www.netlify.com/docs/redirects/

            redirects = redirects.map(function (redirect) {
              var status = redirect.isPermanent ? 301 : 302;
              return `${redirect.fromPath}  ${redirect.toPath}  ${status}`;
            });

            appendToFile = false;

            // Websites may also have statically defined redirects
            // In that case we should append to them (not overwrite)
            // Make sure we aren't just looking at previous build results though

            _context.next = 8;
            return (0, _fsExtra.exists)(FILE_PATH);

          case 8:
            fileExists = _context.sent;

            if (!fileExists) {
              _context.next = 14;
              break;
            }

            _context.next = 12;
            return (0, _fsExtra.readFile)(FILE_PATH);

          case 12:
            fileContents = _context.sent;

            if (fileContents.indexOf(_constants.HEADER_COMMENT) < 0) {
              appendToFile = true;
            }

          case 14:
            data = `${_constants.HEADER_COMMENT}\n\n${redirects.join(`\n`)}`;
            return _context.abrupt("return", appendToFile ? (0, _fsExtra.appendFile)(FILE_PATH, `\n\n${data}`) : (0, _fsExtra.writeFile)(FILE_PATH, data));

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function writeRedirectsFile(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return writeRedirectsFile;
}();