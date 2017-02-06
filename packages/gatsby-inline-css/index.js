"use strict";

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import { prefixLink } from './gatsby-helpers'

var stylesStr = void 0;
if (process.env.NODE_ENV === `production`) {
  try {
    stylesStr = require(`!raw!public/styles.css`);
  } catch (e) {
    console.log(e);
  }
}

var htmlStyles = function htmlStyles() {
  var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (process.env.NODE_ENV === `production`) {
    if (args.link) {
      // If the user wants to reference the external stylesheet return a link.
      //return <link rel="stylesheet" type="text/css" href={prefixLink(`/styles.css`)} media="screen" />
    } else {
      // Default to returning the styles inlined.
      return _react2.default.createElement("style", { id: "gatsby-inlined-css", dangerouslySetInnerHTML: { __html: stylesStr } });
    }
  }

  // In dev just return an empty style element.
  return _react2.default.createElement("style", null);
};

module.exports = htmlStyles;