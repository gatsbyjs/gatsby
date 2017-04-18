const select = require("unist-util-select")
const Promise = require("bluebird")
const fs = require("fs")
const jsYaml = require("js-yaml")
const _ = require("lodash")
const crypto = require("crypto")

async function onNodeCreate({ node, boundActionCreators, loadNodeContent }) {
  const { createNode, updateNode } = boundActionCreators
  if (node.mediaType !== `text/yaml`) {
    return
  }

  const content = await loadNodeContent(node)
  const yamlArray = jsYaml.load(content).map(obj => {
    const objStr = JSON.stringify(obj)
    const contentDigest = crypto.createHash("md5").update(objStr).digest("hex")

    return {
      ...obj,
      id: obj.id ? obj.id : contentDigest,
      contentDigest,
      type: _.capitalize(node.name),
      mediaType: `application/json`,
      parent: node.id,
      children: [],
      content: objStr,
    }
  })

  node.children = node.children.concat(yamlArray.map(y => y.id))
  updateNode(node)
  _.each(yamlArray, y => createNode(y))
  return
}

exports.onNodeCreate = onNodeCreate
