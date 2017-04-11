const select = require("unist-util-select")
const Promise = require("bluebird")
const fs = require("fs")
const jsYaml = require("js-yaml")
const _ = require("lodash")
const { loadNodeContents } = require("gatsby-source-filesystem")

async function onNodeCreate({ node, actionCreators }) {
  const { createNode, updateNode } = actionCreators
  if (node.extension === `yaml` || node.extension === `yml`) {
    const content = await loadNodeContents(node)
    // TODO validate that yaml object has an id field?
    // Or just add an id if one isn't set?
    const yamlArray = jsYaml.load(content).map(obj => ({
      ...obj,
      parent: node.id,
      _sourceNodeId: node.id,
      type: _.capitalize(node.name),
      children: [],
    }))

    node.children = node.children.concat(yamlArray)
    updateNode(node)
    _.each(yamlArray, y => createNode(y))
  }
}

exports.onNodeCreate = onNodeCreate
