"use strict";

var Remark = require(`remark`);
var visit = require(`unist-util-visit`);

var plugin = require(`../`);

var remark = new Remark().data(`settings`, {
  commonmark: true,
  footnotes: true,
  pedantic: true
});

describe(`gatsby-remark-autolink-headers`, function () {
  it(`adds id to a markdown header`, function () {
    var markdownAST = remark.parse(`# Heading Uno`);

    var transformed = plugin({ markdownAST });

    visit(transformed, `heading`, function (node) {
      expect(node.data.id).toBeDefined();

      expect(node).toMatchSnapshot();
    });
  });

  it(`adds ids to each markdown header`, function () {
    var markdownAST = remark.parse(`
# Heading One

## Heading Two

### Heading Three
    `);

    var transformed = plugin({ markdownAST });

    visit(transformed, `heading`, function (node) {
      expect(node.data.id).toBeDefined();
    });
  });
});