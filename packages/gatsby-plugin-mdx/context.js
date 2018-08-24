/* eslint-disable */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MDXScopeProvider = exports.withMDXScope = undefined;

var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _createReactContext2 = require("create-react-context");

var _createReactContext3 = _interopRequireDefault(_createReactContext2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _objectWithoutProperties(obj, keys) {
  var target = {};
  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }
  return target;
}

var _createReactContext = (0, _createReactContext3.default)({}),
  Provider = _createReactContext.Provider,
  Consumer = _createReactContext.Consumer;

/* eslint-disable react/display-name */

var withMDXScope = function withMDXScope(Component) {
  return function(_ref) {
    var scope = _ref.scope,
      props = _objectWithoutProperties(_ref, ["scope"]);

    return _react2.default.createElement(Consumer, null, function(
      contextScope
    ) {
      return _react2.default.createElement(
        Component,
        _extends({ scope: scope || contextScope }, props)
      );
    });
  };
};

exports.withMDXScope = withMDXScope;
var MDXScopeProvider = (exports.MDXScopeProvider = function MDXScopeProvider(
  _ref2
) {
  var __mdxScope = _ref2.__mdxScope,
    children = _ref2.children;
  return _react2.default.createElement(
    Provider,
    { value: __mdxScope },
    children
  );
});

/*
import React from "react";
import createReactContext from "create-react-context";

const { Provider, Consumer } = createReactContext({});

export const withMDXScope = Component => ({ scope, ...props }) => (
  <Consumer>
    {contextScope => <Component scope={scope || contextScope} {...props} />}
  </Consumer>
);

export const MDXScopeProvider = ({ __mdxScope, children }) => (
  <Provider value={__mdxScope}>{children}</Provider>
);
*/
