'use strict'

const { join } = require(`path`)

module.exports = {
  OPTION_DEFAULT_CODEPEN_EXTERNALS: [
    `https://unpkg.com/react/umd/react.development.js`,
    `https://unpkg.com/react-dom/umd/react-dom.development.js`,
  ],
  OPTION_DEFAULT_DIRECTORY: `examples/`,
  OPTION_DEFAULT_LINK_TEXT: `REPL`,
  OPTION_DEFAULT_REDIRECT_TEMPLATE_PATH: join(__dirname, `default-redirect-template.js`),
  PROTOCOL_BABEL: `babel://`,
  PROTOCOL_CODEPEN: `codepen://`,
}