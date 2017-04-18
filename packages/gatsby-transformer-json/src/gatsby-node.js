const select = require("unist-util-select")
const Promise = require("bluebird")
const fs = require("fs")
const _ = require("lodash")
const crypto = require("crypto")

async function onNodeCreate({ node, boundActionCreators, loadNodeContents }) {
  const { createNode, updateNode } = boundActionCreators

  // Don't reprocess our own nodes!  (note: this doesn't normally happen
  // but since this transformer creates new nodes with the same media-type
  // as its parent node, we have to add this check that we didn't create
  // the node).
  if (node.pluginName === `gatsby-transformer-json`) {
    return
  }

  // We only care about JSON content.
  if (node.mediaType !== `application/json`) {
    return
  }

  const content = await loadNodeContents(node)
  const JSONArray = JSON.parse(content).map(obj => {
    const objStr = JSON.stringify(obj)
    const contentDigest = crypto.createHash("md5").update(objStr).digest("hex")

    return {
      ...obj,
      id: obj.id ? obj.id : contentDigest,
      contentDigest,
      mediaType: `application/json`,
      parent: node.id,
      // TODO make choosing the "type" a lot smarter. This assumes
      // the parent node is a file.
      type: _.capitalize(node.name),
      children: [],
      content: objStr,
    }
  })

  node.children = node.children.concat(JSONArray.map(n => n.id))
  updateNode(node)
  _.each(JSONArray, j => createNode(j))

  return
}

exports.onNodeCreate = onNodeCreate
