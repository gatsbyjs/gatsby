const select = require(`unist-util-select`)
const Promise = require(`bluebird`)
const fs = require(`fs`)
const _ = require(`lodash`)
const crypto = require(`crypto`)

async function onNodeCreate({ node, boundActionCreators, loadNodeContent }) {
  const { createNode, updateNode } = boundActionCreators

  // Don't reprocess our own nodes!  (note: this doesn't normally happen
  // but since this transformer creates new nodes with the same media-type
  // as its parent node, we have to add this check that we didn't create
  // the node).
  if (node.internal.pluginName === `gatsby-transformer-lowdb`) {
    return
  }

  // We only care about JSON content.
  if (node.internal.mediaType !== `application/json`) {
    return
  }

  const content = await loadNodeContent(node)
  _.forOwn(JSON.parse(content), (value, key) => {
    const JSONArray = value.map((obj, i) => {
      const objStr = JSON.stringify(obj)
      const contentDigest = crypto.createHash(`md5`).update(objStr).digest(`hex`)

      return Object.assign({}, obj, {
        id: obj.id ? obj.id : `${key} [${i}] >>> JSON`,
        children: [],
        parent: node.id,
        internal: {
          contentDigest,
          mediaType: `application/json`,
          // TODO make choosing the "type" a lot smarter. This assumes
          // the parent node is a file.
          // PascalCase
          type: _.upperFirst(_.camelCase(`${key} Json`)),
          content: objStr,
        },
      })
    })

    //node.children = node.children.concat(JSONArray.map(n => n.id))
    //updateNode(node)
    _.each(JSONArray, j => createNode(j))
  })

  return
}

exports.onNodeCreate = onNodeCreate
