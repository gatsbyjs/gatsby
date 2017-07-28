"use strict";

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getInstance = function getInstance(props) {
  var pathPrefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

  Object.assign(global.window, {
    __PREFIX_PATHS__: pathPrefix ? true : false,
    __PATH_PREFIX__: pathPrefix
  });

  var Link = require("../").default;
  return new Link(props);
};

var getNavigateTo = function getNavigateTo() {
  Object.assign(global.window, {
    ___navigateTo: jest.fn()
  });

  return require("../").navigateTo;
};

describe("<Link />", function () {
  describe("path prefixing", function () {
    it("does not include path prefix by default", function () {
      var to = "/path";
      var instance = getInstance({
        to: to
      });

      expect(instance.state.to).toEqual(to);
    });

    /*
     * Running _both_ of these tests causes the globals to be cached or something
     */
    it.skip("will use __PATH_PREFIX__ if __PREFIX_PATHS__ defined", function () {
      var to = "/path";
      var pathPrefix = "/blog";

      var instance = getInstance({
        to: to
      }, pathPrefix);

      expect(instance.state.to).toEqual("" + pathPrefix + to);
    });
  });

  it("navigateTo is called with correct args", function () {
    getNavigateTo()("/some-path");

    expect(global.window.___navigateTo).toHaveBeenCalledWith("/some-path");
  });
});