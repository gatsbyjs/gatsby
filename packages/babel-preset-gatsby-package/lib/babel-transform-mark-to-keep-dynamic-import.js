const path = require(`path`)

/**
 * @typedef {import('@babel/core').NodePath} NodePath
 * @typedef {import('@babel/core').PluginObj} PluginObj
 * @typedef {import('@babel/core').PluginPass} PluginPass
 * @typedef {import('@babel/core').types} BabelTypes
 * @typedef {import('@babel/core').types.Identifier} Identifier
 * @typedef {import('@babel/core').types.MemberExpression} MemberExpression
 */

/**
 * @typedef {Object} IPluginOptions
 * @property {Array<string>} keepDynamicImports
 */

/**
 *
 * @param {{ types: BabelTypes }} _unused
 * @param {Partial<IPluginOptions>} opts
 * @returns {PluginObj}
 */
module.exports = function keepDynamicImports(
  _unused,
  opts
) {
  if (!opts.keepDynamicImports) {
    throw new Error(`keepDynamicImports option needs to be set`)
  } else if (!Array.isArray(opts.keepDynamicImports)) {
    throw new Error(`keepDynamicImports option needs to be an array`)
  }

  const absolutePaths = opts.keepDynamicImports.map(p => path.resolve(p))

  return {
    name: `babel-transform-mark-to-keep-dynamic-import`,
    visitor: {
      Program() {
        const filename = this.file?.opts?.filename
        if (!filename) {
          return
        }

        if (absolutePaths.includes(filename)) {
          // this is big hack - it relies on some babel plugins internal to basically
          // do early return ( https://github.com/babel/babel/blob/3526b79c87863052f1c61ec0c49c0fc287ba32e6/packages/babel-plugin-transform-modules-commonjs/src/index.ts#L174 )
          // on top of that `BabelFile` doesn't expose delete for the metadata,
          // so we reach into internal `_map` to delete it
          this.file._map.delete("@babel/plugin-proposal-dynamic-import")
        }
      }
    },
  }
}
