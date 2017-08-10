"use strict";

var visit = require(`unist-util-visit`);
var katex = require(`katex`);
var remarkMath = require(`remark-math`);

module.exports = function (_ref) {
  var markdownAST = _ref.markdownAST;

  visit(markdownAST, `inlineMath`, function (node) {
    node.type = `html`;
    node.value = katex.renderToString(node.value, {
      displayMode: false
    });
  });

  visit(markdownAST, `math`, function (node) {
    node.type = `html`;
    node.value = katex.renderToString(node.value, {
      displayMode: true
    });
  });
};

module.exports.setParserPlugins = function () {
  return [remarkMath];
};