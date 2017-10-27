const _ = require(`lodash`)
const crypto = require(`crypto`)
const path = require(`path`)

async function onCreateNode({ node, boundActionCreators, loadNodeContent }) {
  function transformObject(obj, id, node, type) {
    console.log(`node.id`, node.id)
    const objStr = JSON.stringify(obj)

    // Just do this when creating nodes (if parent)
    const addParentToSubObjects = data => {
      _.each(data, (v, k) => {
        if (_.isArray(v) && _.isObject(v[0])) {
          _.each(v, o => addParentToSubObjects(o))
        } else if (_.isObject(v)) {
          addParentToSubObjects(v)
        }
      })
      data._PARENT = node.id
    }

    addParentToSubObjects(obj)

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
    createNode(jsonNode)
    createParentChildLink({ parent: node, child: jsonNode })
  }

  const { createNode, createParentChildLink } = boundActionCreators

  // We only care about JSON content.
  if (node.internal.mediaType !== `application/json`) {
    return
  }

  const content = await loadNodeContent(node)
  const parsedContent = JSON.parse(content)

  if (_.isArray(parsedContent)) {
    parsedContent.forEach((obj, i) => {
      transformObject(
        obj,
        obj.id ? obj.id : `${node.id} [${i}] >>> JSON`,
        node,
        _.upperFirst(_.camelCase(`${node.name} Json`))
      )
    })
  } else if (_.isPlainObject(parsedContent)) {
    transformObject(
      parsedContent,
      parsedContent.id ? parsedContent.id : `${node.id} >>> JSON`,
      node,
      _.upperFirst(_.camelCase(`${path.basename(node.dir)} Json`))
    )
  }
}

exports.onCreateNode = onCreateNode
