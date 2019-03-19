"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _index = _interopRequireDefault(require("../index"));

var _jsxFileName = "/Users/michael/Sites/open-source/forks/gatsby/packages/gatsby-image/src/withIEPolyfill/index.js";
// Dynamically load polyfill for object-fit/object-position if needed (e.g. in IE)
var testImg = document.createElement("img");

if (typeof testImg.style.objectFit === "undefined" || typeof testImg.style.objectPosition === "undefined") {
  import("object-fit-images").then(function (_ref) {
    var ObjectFitImages = _ref.default;
    return ObjectFitImages();
  });
}

function ImageWithIEPolyfill(_ref2) {
  var objectFit = _ref2.objectFit,
      objectPosition = _ref2.objectPosition,
      props = (0, _objectWithoutPropertiesLoose2.default)(_ref2, ["objectFit", "objectPosition"]);
  return _react.default.createElement(_index.default, (0, _extends2.default)({}, props, {
    imgStyle: (0, _extends2.default)({}, props.imgStyle, {
      objectFit: objectFit,
      objectPosition: objectPosition,
      fontFamily: "\"object-fit: " + objectFit + "; object-position: " + objectPosition + "\""
    }),
    __source: {
      fileName: _jsxFileName,
      lineNumber: 18
    },
    __self: this
  }));
}

ImageWithIEPolyfill.propTypes = {
  objectFit: _propTypes.default.string,
  objectPosition: _propTypes.default.string
};
ImageWithIEPolyfill.defaultProps = {
  objectFit: "cover",
  objectPosition: "50% 50%"
};
var _default = ImageWithIEPolyfill;
exports.default = _default;