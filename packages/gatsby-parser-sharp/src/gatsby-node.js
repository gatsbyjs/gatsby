const select = require(`unist-util-select`)
const Promise = require(`bluebird`)

exports.modifyAST = ({ args }) => (
  new Promise((resolve) => {
    const { ast } = args
    const files = select(ast, `
      File[extension="jpeg"],
      File[extension="jpg"],
      File[extension="png"],
      File[extension="webp"],
      File[extension="tif"],
      File[extension="tiff"],
      File[extension="svg"]
    `)
    files.forEach((file) => {
      const imageNode = {
        _sourceNodeId: file.id,
        type: `ImageSharp`,
        id: `${file.id} >> ImageSharp`,
        children: [],
      }

      file.children.push(imageNode)
    })

    return resolve(ast)
  })
)
