"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _require = require("../gatsby-ssr"),
    onRenderBody = _require.onRenderBody;

describe("Adds canonical link to head correctly", function () {
  it("creates a canonical link if siteUrl is set",
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee() {
    var pluginOptions, setHeadComponents, pathname;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            pluginOptions = {
              siteUrl: "http://someurl.com"
            };
            setHeadComponents = jest.fn();
            pathname = "/somepost";
            _context.next = 5;
            return onRenderBody({
              setHeadComponents: setHeadComponents,
              pathname: pathname
            }, pluginOptions);

          case 5:
            expect(setHeadComponents).toMatchSnapshot();
            expect(setHeadComponents).toHaveBeenCalledTimes(1);

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  })));
  it("does not create a canonical link if siteUrl is not set",
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2() {
    var pluginOptions, setHeadComponents, pathname;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            pluginOptions = {};
            setHeadComponents = jest.fn();
            pathname = "/somepost";
            _context2.next = 5;
            return onRenderBody({
              setHeadComponents: setHeadComponents,
              pathname: pathname
            }, pluginOptions);

          case 5:
            expect(setHeadComponents).toMatchSnapshot();
            expect(setHeadComponents).toHaveBeenCalledTimes(0);

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  })));
});