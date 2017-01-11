const select = require(`unist-util-select`)
const Promise = require(`bluebird`)
const fs = require(`fs`)
const jsYaml = require(`js-yaml`)
const _ = require(`lodash`)

exports.modifyAST = ({ args }) => (
  new Promise((resolve) => {
    const { ast } = args
    const files = select(ast, `
      File[extension="yaml"],
      File[extension="yml"]
    `)
    files.forEach((file) => {
      const fileContents = fs.readFileSync(file.sourceFile, `utf-8`)
      const yamlArray = jsYaml.load(fileContents).map((obj) => ({
        ...obj,
        _sourceNodeId: file.id,
        type: _.capitalize(file.name),
        children: [],
      }))

      file.children = file.children.concat(yamlArray)
    })

    return resolve(ast)
  })
)
