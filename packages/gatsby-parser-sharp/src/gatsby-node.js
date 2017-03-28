const select = require("unist-util-select")
const Promise = require("bluebird")

exports.modifyDataTree = ({ args }) =>
  new Promise(resolve => {
    const { dataTree } = args
    const files = select(
      dataTree,
      `
      File[extension="jpeg"],
      File[extension="jpg"],
      File[extension="png"],
      File[extension="webp"],
      File[extension="tif"],
      File[extension="tiff"],
      File[extension="svg"]
    `
    )
    files.forEach(file => {
      const imageNode = {
        _sourceNodeId: file.id,
        type: `ImageSharp`,
        id: `${file.id} >> ImageSharp`,
        children: [],
      }

      file.children.push(imageNode)
    })

    return resolve(dataTree)
  })
