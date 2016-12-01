"use strict";

var select = require("unist-util-select");
var Promise = require("bluebird");
var fs = require("fs");

var _require = require("graphql-relay"),
    toGlobalId = _require.toGlobalId;

var grayMatter = require("gray-matter");

exports.modifyAST = function (_ref) {
  var args = _ref.args;

  return new Promise(function (resolve) {
    var ast = args.ast;

    var files = select(ast, "File[extension=\"md\"], File[extension=\"markdown\"]");
    console.time("parse markdown file");
    files.forEach(function (file) {
      var fileContents = fs.readFileSync(file.sourceFile, "utf-8");
      var data = grayMatter(fileContents);
      var markdownNode = {
        type: "Markdown",
        parent: file,
        id: toGlobalId("Markdown", file.sourceFile + " >> markdown"),
        children: [],
        src: data.content,
        frontmatter: data.data
      };

      file.children.push(markdownNode);
    });
    console.timeEnd("parse markdown file");
    return resolve(ast);
  });
};