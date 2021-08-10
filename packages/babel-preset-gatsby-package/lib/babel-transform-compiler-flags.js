
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
 * @property {Record<string, string>} flags
 * @property {Array<string>} availableFlags
 */

/**
 *
 * @param {{ types: BabelTypes }} args
 * @param {Partial<IPluginOptions>} opts
 * @returns {PluginObj}
 */
module.exports = function compilerFlags(
  {
    types: t,
  },
  opts
) {
  if (!opts.flags) {
    throw new Error(`flags option needs to be set`)
  }
  if (!opts.availableFlags) {
    throw new Error(`availableFlags option needs to be set`)
  }

  return {
    name: `babel-transform-compiler-flags`,
    visitor: {
      /**
       * @param {NodePath} nodePath
       * @param {PluginPass} state
       */
      Identifier(
        nodePath,
        state
      ) {
        const identifier = /** @type {Identifier} */ (nodePath.node)
        const flags = /** @type {IPluginOptions} */ (state.opts).flags
        const availableFlags = /** @type {IPluginOptions} */ (state.opts).availableFlags

        if (
          identifier.name === `_CFLAGS_` &&
          t.isMemberExpression(nodePath.parent)
        ) {
          const parentNode = /** @type {MemberExpression} */ (nodePath.parent)
          const cFlag = /** @type {Identifier} */ (parentNode.property).name

          if (!availableFlags.includes(cFlag)) {
            throw new Error(
              `${cFlag} is not part of the available compiler flags.`
            )
          }

          nodePath.parentPath.replaceWith(
            t.stringLiteral(flags[cFlag] ? flags[cFlag] : ``)
          )
        }
      },
    },
  }
}
