'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRouter = require('react-router');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GatsbyRedirect = function (_React$Component) {
    (0, _inherits3.default)(GatsbyRedirect, _React$Component);

    function GatsbyRedirect() {
        (0, _classCallCheck3.default)(this, GatsbyRedirect);
        return (0, _possibleConstructorReturn3.default)(this, (GatsbyRedirect.__proto__ || (0, _getPrototypeOf2.default)(GatsbyRedirect)).apply(this, arguments));
    }

    (0, _createClass3.default)(GatsbyRedirect, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (process.env.NODE_ENV === 'production') {
                window.___navigateTo(this.props.pathContext.to);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(_reactRouter.Route, {
                path: '*',
                render: function render() {
                    return _react2.default.createElement(_reactRouter.Redirect, { to: _this2.props.pathContext.to });
                }
            });
        }
    }]);
    return GatsbyRedirect;
}(_react2.default.Component); /* global window */

GatsbyRedirect.propTypes = {
    pathContext: _propTypes2.default.shape({
        to: _propTypes2.default.string.isRequired
    })
};

exports.default = GatsbyRedirect;