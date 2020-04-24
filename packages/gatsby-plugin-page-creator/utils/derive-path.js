"use strict";

exports.derivePath = function derivePath(absolutePath, node) {
  var _absolutePath$split = absolutePath.split("src/pages"),
      path = _absolutePath$split[1];

  path = path.replace(/\.[a-z]+$/, "");
  var slugParts = /(\[.*\])/g.exec(path);
  slugParts.forEach(function (slugPart) {
    var key = slugPart.replace(/(\[|\])/g, "");
    var value = node[key]; // throw if the key does not exist on node

    path = path.replace(slugPart, value);
  });
  return path;
};