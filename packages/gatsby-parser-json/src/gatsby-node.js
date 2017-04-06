const select = require("unist-util-select")
const Promise = require("bluebird")
const fs = require("fs")
const _ = require("lodash")

const { loadNodeContents } = require("gatsby-source-filesystem")

async function onNodeCreate({ node, actionCreators }) {
  const { createNode, updateNode } = actionCreators
  if (node.extension === `json`) {
    const content = await loadNodeContents(node)
    // TODO validate that the JSON object has an id field?
    // Or just add an id if one isn't set?
    const JSONArray = JSON.parse(content).map(obj => ({
      ...obj,
      _sourceNodeId: node.id,
      parent: node.id,
      type: _.capitalize(node.name),
      children: [],
    }))

    node.children = node.children.concat(JSONArray.map(n => n.id))
    updateNode(node)
    _.each(JSONArray, j => createNode(j))
  }
}

exports.onNodeCreate = onNodeCreate
