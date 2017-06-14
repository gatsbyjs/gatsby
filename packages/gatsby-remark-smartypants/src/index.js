const retext = require(`retext`)
const visit = require(`unist-util-visit`)
const smartypants = require(`retext-smartypants`)
var defaults = require('lodash.defaults');

module.exports = function (_ref) {
  var markdownAST = _ref.markdownAST;
  var pluginOptions = _ref.pluginOptions;
  var defaultOptions = {
  }
  
  var options = defaults(pluginOptions, defaultOptions)

  visit(markdownAST, `text`, function (node) {
    var processedText = String(retext().use(smartypants, options).process(node.value));
    node.value = processedText;
  });
};