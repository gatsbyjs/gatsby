"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _require = require("path"),
    resolve = _require.resolve;

var _require2 = require("fs-extra"),
    exists = _require2.exists,
    readFile = _require2.readFile,
    writeFile = _require2.writeFile;

var sqip = require("sqip");

var generateSqip = require("../generate-sqip.js");

jest.mock("sqip", function () {
  return jest.fn(function () {
    return {
      final_svg: "<svg><!-- Mocked SQIP SVG --></svg>"
    };
  });
});
jest.mock("fs-extra", function () {
  return {
    exists: jest.fn(function () {
      return false;
    }),
    readFile: jest.fn(function () {
      return "<svg><!-- Cached SQIP SVG --></svg>";
    }),
    writeFile: jest.fn()
  };
});
afterEach(function () {
  sqip.mockClear();
  exists.mockClear();
  readFile.mockClear();
  writeFile.mockClear();
});
describe("gatsby-transformer-sqip",
/*#__PURE__*/
(0, _asyncToGenerator2.default)(
/*#__PURE__*/
_regenerator.default.mark(function _callee3() {
  var absolutePath, cacheDir;
  return _regenerator.default.wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          absolutePath = resolve(__dirname, "images", "this-file-does-not-neet-to-exist-for-the-test.jpg");
          cacheDir = __dirname;
          describe("generateSqip", function () {
            it("not cached",
            /*#__PURE__*/
            (0, _asyncToGenerator2.default)(
            /*#__PURE__*/
            _regenerator.default.mark(function _callee() {
              var cache, numberOfPrimitives, blur, mode, result, sqipArgs;
              return _regenerator.default.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      cache = {
                        get: jest.fn(),
                        set: jest.fn()
                      };
                      numberOfPrimitives = 5;
                      blur = 0;
                      mode = 3;
                      _context.next = 6;
                      return generateSqip({
                        cache: cache,
                        cacheDir: cacheDir,
                        absolutePath: absolutePath,
                        numberOfPrimitives: numberOfPrimitives,
                        blur: blur,
                        mode: mode
                      });

                    case 6:
                      result = _context.sent;
                      expect(result).toMatchSnapshot();
                      expect(sqip).toHaveBeenCalledTimes(1);
                      sqipArgs = sqip.mock.calls[0][0];
                      expect(sqipArgs.filename).toMatch(absolutePath);
                      delete sqipArgs.filename;
                      expect(sqipArgs).toMatchSnapshot();
                      expect(exists).toHaveBeenCalledTimes(1);
                      expect(writeFile).toHaveBeenCalledTimes(1);
                      expect(readFile).toHaveBeenCalledTimes(0);

                    case 16:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee, this);
            })));
            it("cached",
            /*#__PURE__*/
            (0, _asyncToGenerator2.default)(
            /*#__PURE__*/
            _regenerator.default.mark(function _callee2() {
              var cache, numberOfPrimitives, blur, mode, result;
              return _regenerator.default.wrap(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      exists.mockImplementationOnce(function () {
                        return true;
                      });
                      cache = {
                        get: jest.fn(),
                        set: jest.fn()
                      };
                      numberOfPrimitives = 5;
                      blur = 0;
                      mode = 3;
                      _context2.next = 7;
                      return generateSqip({
                        cache: cache,
                        cacheDir: cacheDir,
                        absolutePath: absolutePath,
                        numberOfPrimitives: numberOfPrimitives,
                        blur: blur,
                        mode: mode
                      });

                    case 7:
                      result = _context2.sent;
                      expect(result).toMatchSnapshot();
                      expect(sqip).toHaveBeenCalledTimes(0);
                      expect(exists).toHaveBeenCalledTimes(1);
                      expect(writeFile).toHaveBeenCalledTimes(0);
                      expect(readFile).toHaveBeenCalledTimes(1);

                    case 13:
                    case "end":
                      return _context2.stop();
                  }
                }
              }, _callee2, this);
            })));
          });

        case 3:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3, this);
})));