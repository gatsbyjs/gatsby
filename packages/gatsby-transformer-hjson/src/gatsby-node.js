const { upperFirst, camelCase, isPlainObject } = require(`lodash`)
const { basename } = require(`node:path`)
const { parse } = require(`hjson`)

function shouldOnCreateNode({ node }) {
  // We only care about HJSON content.
  // NOTE the mime package does not recognize HJSON yet
  // See RFC https://hjson.org/rfc.html#rfc.section.1.3
  return (
    node.internal.mediaType === `text/hjson` ||
    node.internal.mediaType === `application/hjson`
  )
}

async function onCreateNode({
  node,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) {
  const { createNode, createParentChildLink } = actions

  function transformObject(obj, id, type) {
    const contentDigest = createContentDigest(obj)
    const jsonNode = {
      ...obj,
      id,
      children: [],
      parent: node.id,
      internal: {
        contentDigest,
        type,
      },
    }
    createNode(jsonNode)
    createParentChildLink({ parent: node, child: jsonNode })
  }

  const content = await loadNodeContent(node)
  const parsedContent = parse(content)

  if (Array.isArray(parsedContent)) {
    parsedContent.forEach((obj, i) => {
      transformObject(
        obj,
        obj.id ? obj.id : createNodeId(`${node.id} [${i}] >>> HJSON`),
        upperFirst(camelCase(`${node.name} HJson`))
      )
    })
  } else if (isPlainObject(parsedContent)) {
    transformObject(
      parsedContent,
      parsedContent.id
        ? parsedContent.id
        : createNodeId(`${node.id} >>> HJSON`),
      upperFirst(camelCase(`${basename(node.dir)} HJson`))
    )
  }
}

exports.shouldOnCreateNode = shouldOnCreateNode
exports.onCreateNode = onCreateNode
