"use strict";

exports.__esModule = true;
exports.getMatchPath = getMatchPath;

function getMatchPath(srcPagesPath) {
  if (srcPagesPath.includes("[") === false) return {}; // Does the following transformations:
  //   `/foo/[id]/` => `/foo/:id`
  //   `/foo/[...id]/` => `/foo/*id`
  //   `/foo/[...]/` => `/foo/*`

  return {
    matchPath: srcPagesPath.replace("[...", "*").replace("[", ":").replace("]", "").replace(/\/$/, "")
  };
}