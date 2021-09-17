"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _react = _interopRequireDefault(require("react"));

var _server = require("react-dom/server");

var _require = require("glamor/server"),
    renderStaticOptimized = _require.renderStaticOptimized;

exports.replaceRenderer = function (_ref) {
  var bodyComponent = _ref.bodyComponent,
      replaceBodyHTMLString = _ref.replaceBodyHTMLString,
      setHeadComponents = _ref.setHeadComponents;

  var _renderStaticOptimize = renderStaticOptimized(function () {
    return (0, _server.renderToString)(bodyComponent);
  }),
      html = _renderStaticOptimize.html,
      css = _renderStaticOptimize.css,
      ids = _renderStaticOptimize.ids;

  replaceBodyHTMLString(html);
  setHeadComponents([/*#__PURE__*/_react.default.createElement("style", {
    id: "glamor-styles",
    key: "glamor-styles",
    dangerouslySetInnerHTML: {
      __html: css
    }
  }), /*#__PURE__*/_react.default.createElement("script", {
    id: "glamor-ids",
    key: "glamor-ids",
    dangerouslySetInnerHTML: {
      __html: "\n        // <![CDATA[\n        window._glamor = " + JSON.stringify(ids) + "\n        // ]]>\n        "
    }
  })]);
};