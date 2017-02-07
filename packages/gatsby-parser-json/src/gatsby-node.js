const select = require(`unist-util-select`)
const Promise = require(`bluebird`)
const fs = require(`fs`)
const _ = require(`lodash`)

const { loadNodeContents } = require(`gatsby-source-filesystem`)

async function modifyAST ({ args }) {
  const { ast } = args
  const files = select(
    ast,
    `
    File[extension="json"]
  `
  )
  const contents = await Promise.map(files, file => loadNodeContents(file))
  files.forEach((file, index) => {
    const fileContents = contents[index]
    const JSONArray = JSON.parse(fileContents).map(obj => ({
      ...obj,
      _sourceNodeId: file.id,
      type: _.capitalize(file.name),
      children: [],
    }))

    file.children = file.children.concat(JSONArray)
  })

  return ast
}

exports.modifyAST = modifyAST
