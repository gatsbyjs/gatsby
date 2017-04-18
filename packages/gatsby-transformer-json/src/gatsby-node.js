const select = require("unist-util-select")
const Promise = require("bluebird")
const fs = require("fs")
const _ = require("lodash")
const crypto = require("crypto")

async function onNodeCreate({ node, boundActionCreators, loadNodeContents }) {
  const { createNode, updateNode } = boundActionCreators
  if (node.extension === `json`) {
    const content = await loadNodeContents(node)
    // TODO validate that the JSON object has an id field?
    // Or just add an id if one isn't set?
    const JSONArray = JSON.parse(content).map(obj => {
      const objStr = JSON.stringify(obj)
      const contentDigest = crypto
        .createHash("md5")
        .update(objStr)
        .digest("hex")

      return {
        ...obj,
        id: obj.id ? obj.id : contentDigest,
        contentDigest,
        mediaType: `application/json`,
        parent: node.id,
        type: _.capitalize(node.name),
        children: [],
        content: objStr,
      }
    })

    node.children = node.children.concat(JSONArray.map(n => n.id))
    updateNode(node)
    _.each(JSONArray, j => createNode(j))
  }
}

exports.onNodeCreate = onNodeCreate
