const MDXRenderer = require("../mdx-renderer");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

module.exports = function renderHTML(rawMDX) {
  return renderToStaticMarkup(React.createElement(MDXRenderer, null, rawMDX));
};
