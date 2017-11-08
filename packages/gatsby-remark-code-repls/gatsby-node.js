'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');

var _require = require('path'),
    extname = _require.extname,
    resolve = _require.resolve;

var recursiveReaddir = require('recursive-readdir');

var _require2 = require('./constants'),
    OPTION_DEFAULT_LINK_TEXT = _require2.OPTION_DEFAULT_LINK_TEXT,
    OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH = _require2.OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH;

exports.createPages = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref) {
    var createPage = _ref.createPage;

    var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref3$directory = _ref3.directory,
        directory = _ref3$directory === undefined ? OPTION_DEFAULT_LINK_TEXT : _ref3$directory,
        _ref3$redirectTemplat = _ref3.redirectTemplate,
        redirectTemplate = _ref3$redirectTemplat === undefined ? OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH : _ref3$redirectTemplat;

    var files;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.error('directory:', directory, 'exists?', fs.existsSync(directory));

            if (fs.existsSync(directory)) {
              _context.next = 4;
              break;
            }

            console.error('Invalid REPL directory specified: "' + directory + '"');
            throw Error('Invalid REPL directory specified: "' + directory + '"');

          case 4:
            if (fs.existsSync(redirectTemplate)) {
              _context.next = 6;
              break;
            }

            throw Error('Invalid redirectTemplate specified: "' + redirectTemplate + '"');

          case 6:
            _context.next = 8;
            return recursiveReaddir(directory);

          case 8:
            files = _context.sent;

            if (!(files.length === 0)) {
              _context.next = 12;
              break;
            }

            console.warn('Specified REPL directory "' + directory + '" contains no files');

            return _context.abrupt('return');

          case 12:

            files.forEach(function (file) {
              if (extname(file) === '.js' || extname(file) === '.jsx') {
                var slug = file.substring(0, file.length - extname(file).length);
                var code = fs.readFileSync(file, 'utf8');

                createPage({
                  path: slug,
                  component: resolve(redirectTemplate),
                  context: {
                    code: code
                  }
                });
              }
            });

          case 13:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
}();