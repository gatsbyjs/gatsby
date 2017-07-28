"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require("path");

var _require = require("../"),
    queueImageResizing = _require.queueImageResizing,
    base64 = _require.base64,
    responsiveSizes = _require.responsiveSizes,
    responsiveResolution = _require.responsiveResolution;

describe("gatsby-plugin-sharp", function () {
  var args = {
    duotone: false,
    grayscale: false,
    rotate: false
  };
  var absolutePath = path.resolve("./www/src/argyle.png");
  var file = {
    id: absolutePath + " absPath of file",
    absolutePath: absolutePath,
    extension: "png",
    internal: {
      contentDigest: "1234"
    }
  };

  describe("responsiveSizes", function () {
    it("includes responsive image properties, e.g. sizes, srcset, etc.", (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
      var result;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return responsiveSizes({ file: file });

            case 2:
              result = _context.sent;


              expect(result).toMatchSnapshot();

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, undefined);
    })));

    it("adds pathPrefix if defined", (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
      var pathPrefix, result;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              pathPrefix = "/blog";
              _context2.next = 3;
              return responsiveSizes({
                file: file,
                args: {
                  pathPrefix: pathPrefix
                }
              });

            case 3:
              result = _context2.sent;


              expect(result.src.indexOf(pathPrefix)).toBe(0);
              expect(result.srcSet.indexOf(pathPrefix)).toBe(0);

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    })));
  });

  describe("base64", function () {
    it("converts image to base64", (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
      var result;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return base64({
                file: file,
                args: args
              });

            case 2:
              result = _context3.sent;


              expect(result).toMatchSnapshot();

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    })));
  });
});