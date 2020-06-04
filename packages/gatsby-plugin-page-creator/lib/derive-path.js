"use strict";

exports.__esModule = true;
exports.derivePath = derivePath;

var _ = require("lodash"); // Generates the path for the page from the file path
// src/pages/product/{id}.js => /product/:id, pulls from nodes.id
// src/pages/product/{sku__en} => product/:sku__en pulls from nodes.sku.en


function derivePath(absolutePath, node) {
  var _absolutePath$split = absolutePath.split("src/pages"),
      path = _absolutePath$split[1];

  path = path.replace(/\.[a-z]+$/, "");
  var slugParts = /(\{.*\})/g.exec(path);
  slugParts.forEach(function (slugPart) {
    var __ = new RegExp("__", "g");

    var key = slugPart.replace(/(\{|\})/g, "").replace(__, ".");

    var value = _.get(node, key); // throw if the key does not exist on node


    path = path.replace(slugPart, value);
  }); // make sure we didnt accidentally get // by appending
  // this probably shouldnt end up in the final api. it's a bit of a hack

  return path.replace("//", "/");
}