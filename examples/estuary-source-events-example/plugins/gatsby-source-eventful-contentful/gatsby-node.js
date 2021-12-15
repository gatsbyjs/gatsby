const { CreateContentfulNodes } = require("./events/CreateContentfulNodes")
const { SourceAllNodes } = require("./events/SourceAllNodes")
const { SourceContentType } = require("./events/SourceContentType")

exports.defineSourceEvents = () => [
  SourceAllNodes,
  SourceContentType,
  CreateContentfulNodes,
]
