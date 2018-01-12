const _ = require(`lodash`)
const uuidv5 = require(`uuid/v5`)

const seedConstant = `677855f4-f45a-4042-b769-93778e374157`
const createId = (id) =>
  uuidv5(id, uuidv5(`sharp`, seedConstant))

module.exports = async function onCreateNode({ node, actions }) {
  const { createNode, createParentChildLink } = actions

  const extensions = [`jpeg`, `jpg`, `png`, `webp`, `tif`, `tiff`]
  if (!_.includes(extensions, node.extension)) {
    return
  }

  const imageNode = {
    id: createId(`${node.id} >> ImageSharp`),
    children: [],
    parent: node.id,
    internal: {
      contentDigest: `${node.internal.contentDigest}`,
      type: `ImageSharp`,
    },
  }

  createNode(imageNode)
  createParentChildLink({ parent: node, child: imageNode })

  return
}
