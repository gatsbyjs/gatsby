// This being a babel.config.js file instead of a .babelrc file allows the
// packages in `internal-plugins` to be compiled with the rest of the source.
// Ref: https://github.com/babel/babel/pull/7358

const configPath = require(`path`).join(__dirname, `..`, `..`, `.babelrc.js`)

module.exports = require(configPath)
