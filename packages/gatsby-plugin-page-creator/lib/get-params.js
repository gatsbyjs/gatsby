"use strict";

exports.__esModule = true;
exports.getParams = getParams;

// This extracts params from its matchPath counerpart
// and returns an object of it's matches.
// e.g.,
//   /foo/:id, /foo/123 => {id: 123}
function getParams(matchPath, realPath) {
  var params = {}; // remove the starting path to simplify the loop

  var matchParts = matchPath.split("/");
  var realParts = realPath.split("/");
  matchParts.forEach(function (part, i) {
    if (!part.startsWith(":")) return;
    var key = part.replace(":", "");
    params[key] = realParts[i];
  });
  return params;
}