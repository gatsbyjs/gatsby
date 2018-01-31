"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _assign = _interopRequireDefault(require("@babel/runtime/core-js/object/assign"));

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _reactRouterDom = require("react-router-dom");

var getInstance = function getInstance(props, pathPrefix) {
  if (pathPrefix === void 0) {
    pathPrefix = "";
  }

  (0, _assign.default)(global.window, {
    __PREFIX_PATHS__: pathPrefix ? true : false,
    __PATH_PREFIX__: pathPrefix
  });
  var context = {
    router: {
      history: {}
    }
  };

  var Link = require("../").default;

  return new Link(props, context);
};

var getNavigateTo = function getNavigateTo() {
  (0, _assign.default)(global.window, {
    ___navigateTo: jest.fn()
  });
  return require("../").navigateTo;
};

var getWithPrefix = function getWithPrefix(pathPrefix) {
  if (pathPrefix === void 0) {
    pathPrefix = "";
  }

  (0, _assign.default)(global.window, {
    __PREFIX_PATHS__: pathPrefix ? true : false,
    __PATH_PREFIX__: pathPrefix
  });
  return require("../").withPrefix;
};

describe("<Link />", function () {
  it("does not fail to initialize when __PREFIX_PATHS__ is not defined", function () {
    expect(function () {
      var context = {
        router: {
          history: {}
        }
      };

      var Link = require("../").default;

      var link = new Link({}, context); //eslint-disable-line no-unused-vars
    }).not.toThrow();
  });
  describe("path prefixing", function () {
    it("does not include path prefix by default", function () {
      var to = "/path";
      var instance = getInstance({
        to: to
      });
      expect(instance.state.to.pathname).toEqual(to);
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
  describe("the location to link to", function () {
    global.___loader = {
      enqueue: jest.fn()
    };
    it("accepts to as a string", function () {
      var location = "/courses?sort=name";
      var node = document.createElement("div");

      var Link = require("../").default;

      _reactDom.default.render(_react.default.createElement(_reactRouterDom.MemoryRouter, null, _react.default.createElement(Link, {
        to: location
      }, "link")), node);

      var href = node.querySelector("a").getAttribute("href");
      expect(href).toEqual(location);
    });
    it("accepts a location \"to\" prop", function () {
      var location = {
        pathname: "/courses",
        search: "?sort=name",
        hash: "#the-hash",
        state: {
          fromDashboard: true
        }
      };
      var node = document.createElement("div");

      var Link = require("../").default;

      _reactDom.default.render(_react.default.createElement(_reactRouterDom.MemoryRouter, null, _react.default.createElement(Link, {
        to: location
      }, "link")), node);

      var href = node.querySelector("a").getAttribute("href");
      expect(href).toEqual("/courses?sort=name#the-hash");
    });
    it("resolves to with no pathname using current location", function () {
      var location = {
        search: "?sort=name",
        hash: "#the-hash"
      };
      var node = document.createElement("div");

      var Link = require("../").default;

      _reactDom.default.render(_react.default.createElement(_reactRouterDom.MemoryRouter, {
        initialEntries: ["/somewhere"]
      }, _react.default.createElement(Link, {
        to: location
      }, "link")), node);

      var href = node.querySelector("a").getAttribute("href");
      expect(href).toEqual("/somewhere?sort=name#the-hash");
    });
  });
  it("navigateTo is called with correct args", function () {
    getNavigateTo()("/some-path");
    expect(global.window.___navigateTo).toHaveBeenCalledWith("/some-path");
  });
});
describe("withRouter", function () {
  describe("works with default prefix", function () {
    it("default prefix does not return \"//\"", function () {
      var to = "/";
      var root = getWithPrefix()(to);
      expect(root).toEqual(to);
    });
    /*
     * Same as above, settings a path perfix does not work because the 
     * link module sets variables on first import
     */

    it.skip("respects path prefix", function () {
      var to = "/abc/";
      var pathPrefix = "/blog";
      var root = getWithPrefix(pathPrefix)(to);
      expect(root).toEqual("" + pathPrefix + to);
    });
  });
});