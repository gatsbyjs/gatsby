"use strict";

var Remark = require(`remark`);
var visit = require(`unist-util-visit`);

var plugin = require(`../`);

var remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true
});

describe(`gatsby-remark-smartypants`, function () {
  it(`applies smartypants to text nodes`, function () {
    var sentence = `He said, "A \'simple\' english sentence. . .`;

    var markdownAST = remark.parse(`
${sentence}
    `);

    var transformed = plugin({ markdownAST });

    visit(transformed, `text`, function (node) {
      expect(node.value).not.toBe(sentence);
      expect(node.value).toMatchSnapshot();
    });
  });

  it(`leaves other nodes alone`, function () {
    var markdownAST = remark.parse(`
# Hello World

a regular sentence

- list item
- other list item

1. numbered
1. other numbered
    `);

    var transformed = plugin({ markdownAST: Object.assign({}, markdownAST) });

    expect(transformed).toEqual(markdownAST);
  });
});