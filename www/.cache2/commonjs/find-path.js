"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.cleanPath = exports.findPath = exports.findMatchPath = exports.setMatchPaths = void 0;

var _utils = require("@reach/router/lib/utils");

var _stripPrefix = _interopRequireDefault(require("./strip-prefix"));

var _normalizePagePath = _interopRequireDefault(require("./normalize-page-path"));

const pathCache = new Map();
let matchPaths = [];

const trimPathname = rawPathname => {
  const pathname = decodeURIComponent(rawPathname); // Remove the pathPrefix from the pathname.

  const trimmedPathname = (0, _stripPrefix.default)(pathname, __BASE_PATH__) // Remove any hashfragment
  .split(`#`)[0] // Remove search query
  .split(`?`)[0];
  return trimmedPathname;
};
/**
 * Set list of matchPaths
 *
 * @param {Array<{path: string, matchPath: string}>} value collection of matchPaths
 */


const setMatchPaths = value => {
  matchPaths = value;
};
/**
 * Return a matchpath url
 * if `match-paths.json` contains `{ "/foo*": "/page1", ...}`, then
 * `/foo?bar=far` => `/page1`
 *
 * @param {string} rawPathname A raw pathname
 * @return {string|null}
 */


exports.setMatchPaths = setMatchPaths;

const findMatchPath = rawPathname => {
  const trimmedPathname = cleanPath(rawPathname);

  for (const {
    matchPath,
    path
  } of matchPaths) {
    if ((0, _utils.match)(matchPath, trimmedPathname)) {
      return (0, _normalizePagePath.default)(path);
    }
  }

  return null;
}; // Given a raw URL path, returns the cleaned version of it (trim off
// `#` and query params), or if it matches an entry in
// `match-paths.json`, its matched path is returned
//
// E.g. `/foo?bar=far` => `/foo`
//
// Or if `match-paths.json` contains `{ "/foo*": "/page1", ...}`, then
// `/foo?bar=far` => `/page1`


exports.findMatchPath = findMatchPath;

const findPath = rawPathname => {
  const trimmedPathname = trimPathname(rawPathname);

  if (pathCache.has(trimmedPathname)) {
    return pathCache.get(trimmedPathname);
  }

  let foundPath = findMatchPath(trimmedPathname);

  if (!foundPath) {
    foundPath = cleanPath(rawPathname);
  }

  pathCache.set(trimmedPathname, foundPath);
  return foundPath;
};
/**
 * Clean a url and converts /index.html => /
 * E.g. `/foo?bar=far` => `/foo`
 *
 * @param {string} rawPathname A raw pathname
 * @return {string}
 */


exports.findPath = findPath;

const cleanPath = rawPathname => {
  const trimmedPathname = trimPathname(rawPathname);
  let foundPath = trimmedPathname;

  if (foundPath === `/index.html`) {
    foundPath = `/`;
  }

  foundPath = (0, _normalizePagePath.default)(foundPath);
  return foundPath;
};

exports.cleanPath = cleanPath;