const retext = require("retext");
const visit = require("unist-util-visit");
const smartypants = require("retext-smartypants");

module.exports = ({ markdownAST }) => {
  visit(markdownAST, `text`, node => {
    const processedText = String(retext().use(smartypants).process(node.value));
    node.value = processedText;
  });
};
