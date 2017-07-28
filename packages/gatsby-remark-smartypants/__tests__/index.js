"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Remark = require("remark");
var visit = require("unist-util-visit");

var plugin = require("../");

var remark = new Remark().data("settings", {
  commonmark: true,
  footnotes: true,
  pedantic: true
});

describe("gatsby-remark-smartypants", function () {
  it("applies smartypants to text nodes", function () {
    var sentence = "He said, \"A 'simple' english sentence. . .";

    var markdownAST = remark.parse("\n" + sentence + "\n    ");

    var transformed = plugin({ markdownAST: markdownAST });

    visit(transformed, "text", function (node) {
      expect(node.value).not.toBe(sentence);
      expect(node.value).toMatchSnapshot();
    });
  });

  it("leaves other nodes alone", function () {
    var markdownAST = remark.parse("\n# Hello World\n\na regular sentence\n\n- list item\n- other list item\n\n1. numbered\n1. other numbered\n    ");

    var transformed = plugin({ markdownAST: (0, _assign2.default)({}, markdownAST) });

    expect(transformed).toEqual(markdownAST);
  });
});