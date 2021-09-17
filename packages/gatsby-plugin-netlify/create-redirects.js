"use strict";

exports.__esModule = true;
exports.default = writeRedirectsFile;

var _constants = require("./constants");

var _fsExtra = require("fs-extra");

async function writeRedirectsFile(pluginData, redirects, rewrites) {
  const {
    publicFolder
  } = pluginData;
  if (!redirects.length && !rewrites.length) return null;
  const FILE_PATH = publicFolder(`_redirects`); // https://www.netlify.com/docs/redirects/

  const NETLIFY_REDIRECT_KEYWORDS_ALLOWLIST = [`query`, `conditions`, `headers`, `signed`, `edge_handler`, `Language`, `Country`]; // Map redirect data to the format Netlify expects

  redirects = redirects.map(redirect => {
    const {
      fromPath,
      isPermanent,
      redirectInBrowser,
      // eslint-disable-line no-unused-vars
      force,
      toPath,
      statusCode,
      ...rest
    } = redirect;
    let status = isPermanent ? `301` : `302`;
    if (statusCode) status = String(statusCode);
    if (force) status = `${status}!`; // The order of the first 3 parameters is significant.
    // The order for rest params (key-value pairs) is arbitrary.

    const pieces = [fromPath, toPath, status];

    for (const key in rest) {
      const value = rest[key];

      if (typeof value === `string` && value.includes(` `)) {
        console.warn(`Invalid redirect value "${value}" specified for key "${key}". ` + `Values should not contain spaces.`);
      } else {
        if (NETLIFY_REDIRECT_KEYWORDS_ALLOWLIST.includes(key)) {
          pieces.push(`${key}=${value}`);
        }
      }
    }

    return pieces.join(`  `);
  });
  rewrites = rewrites.map(({
    fromPath,
    toPath
  }) => `${fromPath}  ${toPath}  200`);
  let commentFound = false; // Websites may also have statically defined redirects
  // In that case we should append to them (not overwrite)
  // Make sure we aren't just looking at previous build results though

  const fileExists = await (0, _fsExtra.exists)(FILE_PATH);
  let fileContents = ``;

  if (fileExists) {
    fileContents = await (0, _fsExtra.readFile)(FILE_PATH, `utf8`);
    commentFound = fileContents.includes(_constants.HEADER_COMMENT);
  }

  let data;

  if (commentFound) {
    const [theirs] = fileContents.split(`\n${_constants.HEADER_COMMENT}\n`);
    data = theirs;
  } else {
    data = fileContents;
  }

  return (0, _fsExtra.writeFile)(FILE_PATH, [data, _constants.HEADER_COMMENT, ...redirects, ...rewrites].join(`\n`));
}