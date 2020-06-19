"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.default = exports.StoreStateProvider = void 0;

var _react = _interopRequireWildcard(require("react"));

var _redux = require("../../redux");

// These weird castings we are doing in this file is because the way gatsby-cli works is that it starts with it's own store
// but then quickly swaps it out with the store from the installed gatsby. This would benefit from a refactor later on
// to not use it's own store temporarily.
// By the time this is actually running, it will become an `IGatsbyState`
const StoreStateContext = (0, _react.createContext)((0, _redux.getStore)().getState());

const StoreStateProvider = ({
  children
}) => {
  const [state, setState] = (0, _react.useState)((0, _redux.getStore)().getState());
  (0, _react.useEffect)(() => (0, _redux.onLogAction)(() => {
    setState((0, _redux.getStore)().getState());
  }), []);
  return /*#__PURE__*/_react.default.createElement(StoreStateContext.Provider, {
    value: state
  }, children);
};

exports.StoreStateProvider = StoreStateProvider;
var _default = StoreStateContext;
exports.default = _default;