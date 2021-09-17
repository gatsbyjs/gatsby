"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = buildHeadersProgram;

var _lodash = _interopRequireDefault(require("lodash"));

var _fsExtra = require("fs-extra");

var _path = require("path");

var _kebabHash = _interopRequireDefault(require("kebab-hash"));

var _constants = require("./constants");

function getHeaderName(header) {
  const matches = header.match(/^([^:]+):/);
  return matches && matches[1];
}

function validHeaders(headers, reporter) {
  if (!headers || !_lodash.default.isObject(headers)) {
    return false;
  }

  return _lodash.default.every(headers, (headersList, path) => _lodash.default.isArray(headersList) && _lodash.default.every(headersList, header => {
    if (_lodash.default.isString(header)) {
      if (!getHeaderName(header)) {
        reporter.panic(`[gatsby-plugin-netlify] ${path} contains an invalid header (${header}). Please check your plugin configuration`);
      }

      return true;
    }

    return false;
  }));
}

function linkTemplate(assetPath, type = `script`) {
  return `Link: <${assetPath}>; rel=preload; as=${type}${type === `fetch` ? `; crossorigin` : ``}`;
}

function pathChunkName(path) {
  const name = path === `/` ? `index` : (0, _kebabHash.default)(path);
  return `path---${name}`;
}

function getPageDataPath(path) {
  const fixedPagePath = path === `/` ? `index` : path;
  return _path.posix.join(`page-data`, fixedPagePath, `page-data.json`);
}

function getScriptPath(file, manifest) {
  const chunk = manifest[file];

  if (!chunk) {
    return [];
  } // convert to array if it's not already


  const chunks = _lodash.default.isArray(chunk) ? chunk : [chunk];
  return chunks.filter(script => {
    const parsed = (0, _path.parse)(script); // handle only .js, .css content is inlined already
    // and doesn't need to be pushed

    return parsed.ext === `.js`;
  });
}

function linkHeaders(files, pathPrefix) {
  const linkHeaders = [];

  for (const resourceType in files) {
    files[resourceType].forEach(file => {
      linkHeaders.push(linkTemplate(`${pathPrefix}/${file}`, resourceType));
    });
  }

  return linkHeaders;
}

function headersPath(pathPrefix, path) {
  return `${pathPrefix}${path}`;
}

function preloadHeadersByPage({
  pages,
  manifest,
  pathPrefix,
  publicFolder
}) {
  const linksByPage = {};
  const appDataPath = publicFolder(_constants.PAGE_DATA_DIR, `app-data.json`);
  const hasAppData = (0, _fsExtra.existsSync)(appDataPath);
  let hasPageData = false;

  if (pages.size) {
    // test if 1 page-data file exists, if it does we know we're on a gatsby version that supports page-data
    const pageDataPath = publicFolder(getPageDataPath(pages.get(pages.keys().next().value).path));
    hasPageData = (0, _fsExtra.existsSync)(pageDataPath);
  }

  pages.forEach(page => {
    const scripts = _lodash.default.flatMap(_constants.COMMON_BUNDLES, file => getScriptPath(file, manifest));

    scripts.push(...getScriptPath(pathChunkName(page.path), manifest));
    scripts.push(...getScriptPath(page.componentChunkName, manifest));
    const json = [];

    if (hasAppData) {
      json.push(_path.posix.join(_constants.PAGE_DATA_DIR, `app-data.json`));
    }

    if (hasPageData) {
      json.push(getPageDataPath(page.path));
    }

    const filesByResourceType = {
      script: scripts.filter(Boolean),
      fetch: json
    };
    const pathKey = headersPath(pathPrefix, page.path);
    linksByPage[pathKey] = linkHeaders(filesByResourceType, pathPrefix);
  });
  return linksByPage;
}

function defaultMerge(...headers) {
  function unionMerge(objValue, srcValue) {
    if (_lodash.default.isArray(objValue)) {
      return _lodash.default.union(objValue, srcValue);
    } else {
      return undefined; // opt into default merge behavior
    }
  }

  return _lodash.default.mergeWith({}, ...headers, unionMerge);
}

function headersMerge(userHeaders, defaultHeaders) {
  const merged = {};
  Object.keys(defaultHeaders).forEach(path => {
    if (!userHeaders[path]) {
      merged[path] = defaultHeaders[path];
      return;
    }

    const headersMap = {};
    defaultHeaders[path].forEach(header => {
      headersMap[getHeaderName(header)] = header;
    });
    userHeaders[path].forEach(header => {
      headersMap[getHeaderName(header)] = header; // override if exists
    });
    merged[path] = Object.values(headersMap);
  });
  Object.keys(userHeaders).forEach(path => {
    if (!merged[path]) {
      merged[path] = userHeaders[path];
    }
  });
  return merged;
}

function transformLink(manifest, publicFolder, pathPrefix) {
  return header => header.replace(_constants.LINK_REGEX, (__, prefix, file, suffix) => {
    const hashed = manifest[file];

    if (hashed) {
      return `${prefix}${pathPrefix}${hashed}${suffix}`;
    } else if ((0, _fsExtra.existsSync)(publicFolder(file))) {
      return `${prefix}${pathPrefix}${file}${suffix}`;
    } else {
      throw new Error(`Could not find the file specified in the Link header \`${header}\`.` + `The gatsby-plugin-netlify is looking for a matching file (with or without a ` + `webpack hash). Check the public folder and your gatsby-config.js to ensure you are ` + `pointing to a public file.`);
    }
  });
} // Writes out headers file format, with two spaces for indentation
// https://www.netlify.com/docs/headers-and-basic-auth/


function stringifyHeaders(headers) {
  return _lodash.default.reduce(headers, (text, headerList, path) => {
    const headersString = _lodash.default.reduce(headerList, (accum, header) => `${accum}  ${header}\n`, ``);

    return `${text}${path}\n${headersString}`;
  }, ``);
} // program methods


const validateUserOptions = (pluginOptions, reporter) => headers => {
  if (!validHeaders(headers, reporter)) {
    throw new Error(`The "headers" option to gatsby-plugin-netlify is in the wrong shape. ` + `You should pass in a object with string keys (representing the paths) and an array ` + `of strings as the value (representing the headers). ` + `Check your gatsby-config.js.`);
  }

  ;
  [`mergeSecurityHeaders`, `mergeLinkHeaders`, `mergeCachingHeaders`].forEach(mergeOption => {
    if (!_lodash.default.isBoolean(pluginOptions[mergeOption])) {
      throw new Error(`The "${mergeOption}" option to gatsby-plugin-netlify must be a boolean. ` + `Check your gatsby-config.js.`);
    }
  });

  if (!_lodash.default.isFunction(pluginOptions.transformHeaders)) {
    throw new Error(`The "transformHeaders" option to gatsby-plugin-netlify must be a function ` + `that returns an array of header strings. ` + `Check your gatsby-config.js.`);
  }

  return headers;
};

const mapUserLinkHeaders = ({
  manifest,
  pathPrefix,
  publicFolder
}) => headers => _lodash.default.mapValues(headers, headerList => _lodash.default.map(headerList, transformLink(manifest, publicFolder, pathPrefix)));

const mapUserLinkAllPageHeaders = (pluginData, {
  allPageHeaders
}) => headers => {
  if (!allPageHeaders) {
    return headers;
  }

  const {
    pages,
    manifest,
    publicFolder,
    pathPrefix
  } = pluginData;

  const headersList = _lodash.default.map(allPageHeaders, transformLink(manifest, publicFolder, pathPrefix));

  const duplicateHeadersByPage = {};
  pages.forEach(page => {
    const pathKey = headersPath(pathPrefix, page.path);
    duplicateHeadersByPage[pathKey] = headersList;
  });
  return defaultMerge(headers, duplicateHeadersByPage);
};

const applyLinkHeaders = (pluginData, {
  mergeLinkHeaders
}) => headers => {
  if (!mergeLinkHeaders) {
    return headers;
  }

  const {
    pages,
    manifest,
    pathPrefix,
    publicFolder
  } = pluginData;
  const perPageHeaders = preloadHeadersByPage({
    pages,
    manifest,
    pathPrefix,
    publicFolder
  });
  return defaultMerge(headers, perPageHeaders);
};

const applySecurityHeaders = ({
  mergeSecurityHeaders
}) => headers => {
  if (!mergeSecurityHeaders) {
    return headers;
  }

  return headersMerge(headers, _constants.SECURITY_HEADERS);
};

const applyCachingHeaders = (pluginData, {
  mergeCachingHeaders
}) => headers => {
  var _pluginData$component, _pluginData$component2, _pluginData$component3;

  if (!mergeCachingHeaders) {
    return headers;
  }

  let chunks = []; // Gatsby v3.5 added componentChunkName to store().components
  // So we prefer to pull chunk names off that as it gets very expensive to loop
  // over large numbers of pages.

  const isComponentChunkSet = !!((_pluginData$component = pluginData.components.entries()) !== null && _pluginData$component !== void 0 && (_pluginData$component2 = _pluginData$component.next()) !== null && _pluginData$component2 !== void 0 && (_pluginData$component3 = _pluginData$component2.value[1]) !== null && _pluginData$component3 !== void 0 && _pluginData$component3.componentChunkName);

  if (isComponentChunkSet) {
    chunks = [...pluginData.components.values()].map(c => c.componentChunkName);
  } else {
    chunks = Array.from(pluginData.pages.values()).map(page => page.componentChunkName);
  }

  chunks.push(`pages-manifest`, `app`);
  const files = [].concat(...chunks.map(chunk => pluginData.manifest[chunk]));
  const cachingHeaders = {};
  files.forEach(file => {
    if (typeof file === `string`) {
      cachingHeaders[`/` + file] = [_constants.IMMUTABLE_CACHING_HEADER];
    }
  });
  return defaultMerge(headers, cachingHeaders, _constants.CACHING_HEADERS);
};

const applyTransfromHeaders = ({
  transformHeaders
}) => headers => _lodash.default.mapValues(headers, transformHeaders);

const transformToString = headers => `${_constants.HEADER_COMMENT}\n\n${stringifyHeaders(headers)}`;

const writeHeadersFile = ({
  publicFolder
}) => contents => (0, _fsExtra.writeFile)(publicFolder(_constants.NETLIFY_HEADERS_FILENAME), contents);

function buildHeadersProgram(pluginData, pluginOptions, reporter) {
  return _lodash.default.flow(validateUserOptions(pluginOptions, reporter), mapUserLinkHeaders(pluginData), applySecurityHeaders(pluginOptions), applyCachingHeaders(pluginData, pluginOptions), mapUserLinkAllPageHeaders(pluginData, pluginOptions), applyLinkHeaders(pluginData, pluginOptions), applyTransfromHeaders(pluginOptions), transformToString, writeHeadersFile(pluginData))(pluginOptions.headers);
}