const has = require(`lodash/has`)
const remarkCustomBlocks = require(`remark-custom-blocks`)

module.exports.setParserPlugins = options => {
  if (!has(options, `blocks`)) {
    throw Error(`missing required "blocks" option`)
  }
  return [[remarkCustomBlocks, options.blocks]]
}
