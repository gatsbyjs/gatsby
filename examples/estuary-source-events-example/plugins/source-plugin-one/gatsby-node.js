const { defineSourceEvent } = require(`gatsby/plugin`)

const SourceAllNodes = defineSourceEvent({
  type: `SourceAllNodes`,
  description: `SourceAllNodes test in source-plugin-one`,
  handler: async ({}, { reporter }) => {
    reporter.log(`HI from source-plugin-one!`)
  },
})

exports.defineSourceEvents = () => [SourceAllNodes]
