"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.generateQueryFromString = generateQueryFromString;
exports.reverseLookupParams = reverseLookupParams;

var _lodash = _interopRequireDefault(require("lodash"));

// Input queryStringParent could be:
//   Product
//   allProduct
//   allProduct(filter: thing)
// End result should be something like { allProducts { nodes { id }}}
function generateQueryFromString(queryStringParent, fileAbsolutePath) {
  var needsAllPrefix = queryStringParent.startsWith("all") === false;
  var fields = extractUrlParamsForQuery(fileAbsolutePath);
  console.log(fields);
  return "{" + (needsAllPrefix ? "all" : "") + queryStringParent + "{nodes{" + fields + "}}}";
} // Takes a query result of something like `{ fields: { value: 'foo' }}` with a filepath of `/fields__value` and
// translates the object into `{ fields__value: 'foo' }`. This is necassary to pass the value
// into a query function for each individual page.


function reverseLookupParams(queryResults, absolutePath) {
  var reversedParams = {};
  absolutePath.split("/").forEach(function (part) {
    var regex = /^\{([a-zA-Z_]+)\}/.exec(part);
    if (regex === null) return;
    var extracted = regex[1];

    var results = _lodash.default.get(queryResults, extracted.replace(/__/g, "."));

    reversedParams[extracted] = results;
  });
  return reversedParams;
} // Changes something like
//   `/Users/site/src/pages/foo/{id}/{baz}`
// to
//   `id,baz`


function extractUrlParamsForQuery(createdPath) {
  var parts = createdPath.split("/");
  return parts.reduce(function (queryParts, part) {
    if (part.startsWith("{")) {
      return queryParts.concat(deriveNesting(part.replace("{", "").replace("}", "").replace(".js", "")));
    }

    return queryParts;
  }, []).join(",");
}

function deriveNesting(part) {
  if (part.includes("__")) {
    return part.split("__").reverse().reduce(function (path, part) {
      if (path) {
        return part + "{" + path + "}";
      }

      return "" + part + path;
    }, "");
  }

  return part;
}