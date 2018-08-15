"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

/* eslint-disable */
const Baz = () => _react.default.createElement("div", null);

const Buz = function Buz() {
  return _react.default.createElement("div", null);
};

function Foo() {
  return _react.default.createElement("div", null);
}

Baz.Foo = () => _react.default.createElement("div", null);
/**
 * Description!
 *
 * @alias {MyComponent}
 */


class Bar extends _react.default.Component {
  render() {
    return _react.default.createElement(Foo, null);
  }

}

(0, _defineProperty2.default)(Bar, "propTypes", {
  /**
   * An object hash of field (fix this @mention?) errors for the form.
   *
   * @type {Foo}
   * @default blue
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
});

const Qux = _react.default.createClass({
  displayName: "Qux",

  render() {
    return _react.default.createElement(Foo, null);
  }

});