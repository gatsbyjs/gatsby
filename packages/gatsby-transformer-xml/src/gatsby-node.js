const parseXml = require(`xml-parser`)
const crypto = require(`crypto`)
const _ = require(`lodash`)

async function onCreateNode({ node, boundActionCreators, loadNodeContent }) {
  const { createNode, createParentChildLink } = boundActionCreators
  
  // We only care about XML content.
  if (![`application/xml`, `text/xml`].includes(node.internal.mediaType)) {
    return
  }
  const rawXml = await loadNodeContent(node)
  const parsedXml = parseXml(rawXml)
  const nodeArray = parsedXml.root.children.map((obj, i) => {
    const objStr = JSON.stringify(obj)
    const contentDigest = crypto
      .createHash(`md5`)
      .update(objStr)
      .digest(`hex`)
    return {
        ...obj,
        id: obj.attributes.id ? obj.attributes.id : `${node.id} [${i}] >>> XML`,
        parent: node.id,
        internal: {
          contentDigest,
          type: _.upperFirst(_.camelCase(`${node.name} xml`)),
        },
      }
  })

  _.each(nodeArray, j => {
    createNode(j)
    createParentChildLink({ parent: node, child: j  })
  })
  return
}

exports.onCreateNode = onCreateNode

