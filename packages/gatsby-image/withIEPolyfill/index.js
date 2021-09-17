"use strict";

const _interopRequireDefault = require(`@babel/runtime/helpers/interopRequireDefault`);

exports.__esModule = true;
exports.default = void 0;

const _extends2 = _interopRequireDefault(require(`@babel/runtime/helpers/extends`));

const _objectWithoutPropertiesLoose2 = _interopRequireDefault(require(`@babel/runtime/helpers/objectWithoutPropertiesLoose`));

const _inheritsLoose2 = _interopRequireDefault(require(`@babel/runtime/helpers/inheritsLoose`));

const _react = _interopRequireWildcard(require(`react`));

const _propTypes = _interopRequireDefault(require(`prop-types`));

const _index = _interopRequireDefault(require(`../index`));

const _excluded = [`objectFit`, `objectPosition`];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== `function`) return null; const cacheBabelInterop = new WeakMap(); const cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== `object` && typeof obj !== `function`) { return { default: obj }; } const cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } const newObj = {}; const hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (const key in obj) { if (key !== `default` && Object.prototype.hasOwnProperty.call(obj, key)) { const desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const ImageWithIEPolyfill = /* #__PURE__*/function (_Component) {
  (0, _inheritsLoose2.default)(ImageWithIEPolyfill, _Component);

  function ImageWithIEPolyfill() {
    let _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _Component.call.apply(_Component, [this].concat(args)) || this;
    _this.imageRef = _this.props.innerRef || /* #__PURE__*/(0, _react.createRef)();
    _this.placeholderRef = /* #__PURE__*/(0, _react.createRef)();
    return _this;
  }

  const _proto = ImageWithIEPolyfill.prototype;

  // Load object-fit/position polyfill if required (e.g. in IE)
  _proto.componentDidMount = function componentDidMount() {
    const _this2 = this;

    const testImg = document.createElement(`img`);

    if (typeof testImg.style.objectFit === `undefined` || typeof testImg.style.objectPosition === `undefined`) {
      Promise.resolve().then(function () {
        return _interopRequireWildcard(require(`object-fit-images`));
      }).then(function (_ref) {
        const ObjectFitImages = _ref.default;
        ObjectFitImages(_this2.imageRef.current.imageRef.current);
        ObjectFitImages(_this2.placeholderRef.current);
      });
    }
  };

  _proto.render = function render() {
    const _this$props = this.props;
        const objectFit = _this$props.objectFit;
        const objectPosition = _this$props.objectPosition;
        const props = (0, _objectWithoutPropertiesLoose2.default)(_this$props, _excluded);
    const polyfillStyle = {
      objectFit: objectFit,
      objectPosition: objectPosition,
      fontFamily: `"object-fit: ` + objectFit + `; object-position: ` + objectPosition + `"`
    };
    return /* #__PURE__*/_react.default.createElement(_index.default, (0, _extends2.default)({
      ref: this.imageRef,
      placeholderRef: this.placeholderRef
    }, props, {
      imgStyle: (0, _extends2.default)({}, props.imgStyle, polyfillStyle),
      placeholderStyle: (0, _extends2.default)({}, props.placeholderStyle, polyfillStyle)
    }));
  };

  return ImageWithIEPolyfill;
}(_react.Component); // If you modify these propTypes, please don't forget to update following files as well:
// https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-image/withIEPolyfill/index.d.ts
// https://github.com/gatsbyjs/gatsby/blob/master/packages/gatsby-image/README.md#gatsby-image-props
// https://github.com/gatsbyjs/gatsby/blob/master/docs/docs/gatsby-image.md#gatsby-image-props


ImageWithIEPolyfill.propTypes = {
  objectFit: _propTypes.default.string,
  objectPosition: _propTypes.default.string
};
ImageWithIEPolyfill.defaultProps = {
  objectFit: `cover`,
  objectPosition: `50% 50%`
};

const _default = /* #__PURE__*/(0, _react.forwardRef)(function (props, ref) {
  return /* #__PURE__*/_react.default.createElement(ImageWithIEPolyfill, (0, _extends2.default)({}, props, {
    innerRef: ref
  }));
});

exports.default = _default;