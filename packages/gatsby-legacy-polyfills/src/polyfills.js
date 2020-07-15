import codegen from "codegen.macro"

codegen`
  const imports = require('./exclude').LEGACY_POLYFILLS;

  module.exports = imports.map(file => 'import "core-js/' + file + '"').join("\\n")
`

import "whatwg-fetch"
import "url-polyfill"
import assign from "object-assign"
Object.assign = assign
