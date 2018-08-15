"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

/**
 * General component description.
 */
class MyComponent extends _react.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "props", void 0);
  }

  render() {// ...
  }

}

exports.default = MyComponent;