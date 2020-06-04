"use strict";

exports.__esModule = true;
exports.queryPartsFromPath = queryPartsFromPath;
exports.generateQueryFromString = generateQueryFromString;

// Changes something like
//   `/Users/site/src/pages/foo/{id}/{baz__bar}`
// to
//   `id,baz{bar}`
function queryPartsFromPath(absolutePath) {
  var parts = absolutePath.split("/");
  return parts.reduce(function (queryParts, filePathPart) {
    if (filePathPart.startsWith("{") && filePathPart.includes("}")) {
      var strippedPart = filePathPart.replace("{", "").replace("}", "").replace(/\..+/, "");
      queryParts.push(strippedPart.split("__").reduce(function (nestedResolutions, part, i) {
        if (i === 0) return part;
        return nestedResolutions + "{" + part + "}";
      }, ""));
    }

    return queryParts;
  }, []).join(",");
} // Input str could be:
//   Product
//   allProduct
//   allProduct(filter: thing)
// End result should be something like { allProducts { nodes { id }}}


function generateQueryFromString(str, fields) {
  var needsAllPrefix = str.startsWith("all") === false;
  return "{" + (needsAllPrefix ? "all" : "") + str + "{nodes{" + fields + "}}}";
}