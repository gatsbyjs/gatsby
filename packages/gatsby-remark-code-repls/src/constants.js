'use strict'

const { join } = require(`path`)

module.exports = {
  OPTION_DEFAULT_LINK_TEXT: `REPL`,
  OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH: join(__dirname, `default-redirect-template.js`),
  PROTOCOL_BABEL: `babel://`,
  PROTOCOL_CODEPEN: `codepen://`,
}