const select = require(`unist-util-select`)
const Promise = require(`bluebird`)
const fs = require(`fs`)
const _ = require(`lodash`)

exports.modifyAST = ({ args }) => (
  new Promise((resolve) => {
    const { ast } = args
    const files = select(ast, `
      File[extension="json"]
    `)
    files.forEach((file) => {
      const fileContents = fs.readFileSync(file.sourceFile, `utf-8`)
      const JSONArray = JSON.parse(fileContents).map((obj) => ({
        ...obj,
        _sourceNodeId: file.id,
        type: _.capitalize(file.name),
        children: [],
      }))

      file.children = file.children.concat(JSONArray)
    })

    return resolve(ast)
  })
)
