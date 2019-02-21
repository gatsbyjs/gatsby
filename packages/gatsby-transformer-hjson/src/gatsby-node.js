const _ = require(`lodash`)
const crypto = require(`crypto`)
const path = require(`path`)
const HJSON = require(`hjson`)

async function onCreateNode({ node, actions, loadNodeContent, createNodeId }) {
  const { createNode, createParentChildLink } = actions

  function transformObject(obj, id, type) {
    const objStr = JSON.stringify(obj)
    const contentDigest = crypto
      .createHash(`md5`)
      .update(objStr)
      .digest(`hex`)
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
    createParentChildLink({ parent: node, child: jsonNode })
    return createNode(jsonNode)
  }

  // We only care about HJSON content.
  // NOTE the mime package does not recognize HJSON yet
  // See RFC https://hjson.org/rfc.html#rfc.section.1.3
  if (
    node.internal.mediaType !== `text/hjson` &&
    node.internal.mediaType !== `application/hjson`
  ) {
    return Promise.resolve()
  }

  const content = await loadNodeContent(node)
  const parsedContent = HJSON.parse(content)

  if (_.isArray(parsedContent)) {
    return Promise.all(
      parsedContent.map((obj, i) =>
        transformObject(
          obj,
          obj.id ? obj.id : createNodeId(`${node.id} [${i}] >>> HJSON`),
          _.upperFirst(_.camelCase(`${node.name} HJson`))
        )
      )
    )
  } else if (_.isPlainObject(parsedContent)) {
    return transformObject(
      parsedContent,
      parsedContent.id
        ? parsedContent.id
        : createNodeId(`${node.id} >>> HJSON`),
      _.upperFirst(_.camelCase(`${path.basename(node.dir)} HJson`))
    )
  }
  return Promise.resolve()
}

exports.onCreateNode = onCreateNode
