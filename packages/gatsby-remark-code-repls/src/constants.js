"use strict"

const { join } = require(`path`)
const normalizePath = require(`normalize-path`)

const baseOptions = {
  OPTION_DEFAULT_LINK_TEXT: `REPL`,
  OPTION_DEFAULT_HTML: `<div id="root"></div>`,
  OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH: normalizePath(
    join(__dirname, `default-redirect-template.js`)
  ),
  OPTION_DEFAULT_INCLUDE_MATCHING_CSS: false,
  PROTOCOL_BABEL: `babel://`,
  PROTOCOL_CODEPEN: `codepen://`,
  PROTOCOL_CODE_SANDBOX: `codesandbox://`,
  PROTOCOL_RAMDA: `ramda://`,
}
module.exports = {
  ...baseOptions,
  OPTION_DEFAULT_CODEPEN: {
    html: baseOptions.OPTION_DEFAULT_HTML,
    externals: [],
    includeMatchingCSS: baseOptions.OPTION_DEFAULT_INCLUDE_MATCHING_CSS,
  },
  OPTION_DEFAULT_CODESANDBOX: {
    html: baseOptions.OPTION_DEFAULT_HTML,
    dependencies: [],
  },
}
