const isNil = require(`lodash/isNil`)
const has = require(`lodash/has`)
const remarkCustomBlocks = require(`remark-custom-blocks`)

module.exports.setParserPlugins = options => {
  if (isNil(options) || !has(options, `blocks`)) {
    throw Error(`missing required "blocks" option`)
  }
  const remarkCustomFormattedBlocks = Object.keys(options.blocks).reduce(
    (blocks, currentBlock) => {
      return {
        ...blocks,
        [currentBlock]: { classes: options.blocks[currentBlock] },
      }
    },
    {}
  )
  return [[remarkCustomBlocks, remarkCustomFormattedBlocks]]
}
