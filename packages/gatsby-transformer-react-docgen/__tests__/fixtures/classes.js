"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _react = _interopRequireDefault(require("react"));

/* eslint-disable */
var Baz = function Baz() {
  return _react.default.createElement("div", null);
};

var Buz = function Buz() {
  return _react.default.createElement("div", null);
};

function Foo() {
  return _react.default.createElement("div", null);
}

var Bar =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(Bar, _React$Component);

  function Bar() {
    return _React$Component.apply(this, arguments) || this;
  }

  var _proto = Bar.prototype;

  _proto.render = function render() {
    return _react.default.createElement(Foo, null);
  };

  return Bar;
}(_react.default.Component);

Object.defineProperty(Bar, "propTypes", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: {
    /**
     * An object hash of field errors for the form.
     */
    objProp: _react.default.PropTypes.object,
    reqProp: _react.default.PropTypes.object.isRequired,

    /**
     * Callback **that** is called when a validation error occurs.
     */
    funcProp: _react.default.PropTypes.func,
    stringProp: _react.default.PropTypes.string,
    boolProp: _react.default.PropTypes.bool,
    "aria-property": _react.default.PropTypes.string,
    enumProp: _react.default.PropTypes.oneOf([true, "john", 5, null, Infinity]),
    otherProp: _react.default.PropTypes.instanceOf(Message),
    shapeProp: _react.default.PropTypes.shape({
      setter: _react.default.PropTypes.func,
      name: _react.default.PropTypes.string
    }),
    unionProp: _react.default.PropTypes.oneOfType([_react.default.PropTypes.func, _react.default.PropTypes.string]),
    reqUnionProp: _react.default.PropTypes.oneOfType([_react.default.PropTypes.func, _react.default.PropTypes.string]).isRequired,

    customProp(props, name, componentName) {
      return _react.default.PropTypes.any.isRequired(props, name, componentName);
    },

    customIdentifier: someValidator,
    customCallExpression: someValidator()
  }
});

var Qux = _react.default.createClass({
  displayName: "Qux",

  render() {
    return _react.default.createElement(Foo, null);
  }

});