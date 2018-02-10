const XLSX = require(`xlsx`)
const fs = require(`fs-extra`)
const _ = require(`lodash`)
const crypto = require(`crypto`)

// read files as `binary` from file system
function _loadNodeContent(fileNode, fallback) {
  return fileNode.absolutePath
    ? fs.readFile(fileNode.absolutePath, `binary`)
    : fallback(fileNode)
}

async function onCreateNode(
  { node, actions, loadNodeContent, createNodeId },
  options
) {
  const { createNode, createParentChildLink } = actions
  const extensions = `xls|xlsx|xlsm|xlsb|xml|xlw|xlc|csv|txt|dif|sylk|slk|prn|ods|fods|uos|dbf|wks|123|wq1|qpw|htm|html`.split(
    `|`
  )
  if (extensions.indexOf((node.extension || ``).toLowerCase()) == -1) {
    return
  }
  // Load binary string
  const content = await _loadNodeContent(node, loadNodeContent)
  // Parse
  let wb = XLSX.read(content, { type: `binary`, cellDates: true })
  wb.SheetNames.forEach((n, idx) => {
    let ws = wb.Sheets[n]
    let parsedContent = XLSX.utils.sheet_to_json(ws, { raw: true })

    if (_.isArray(parsedContent)) {
      const csvArray = parsedContent.map((obj, i) => {
        const objStr = JSON.stringify(obj)
        const contentDigest = crypto
          .createHash(`md5`)
          .update(objStr)
          .digest(`hex`)

        return {
          ...obj,
          id: obj.id
            ? obj.id
            : createNodeId(`${node.id} [${n} ${i}] >>> ${node.extension}`),
          children: [],
          parent: node.id,
          internal: {
            contentDigest,
            type:
              _.upperFirst(_.camelCase(`${node.name} ${node.extension}`)) +
              `__` +
              _.upperFirst(_.camelCase(`${n}`)),
          },
        }
      })

      _.each(csvArray, y => {
        createNode(y)
        createParentChildLink({ parent: node, child: y })
      })

      const shObj = { name: n, idx: idx }
      const shStr = JSON.stringify(shObj)
      const contentDigest = crypto
        .createHash(`md5`)
        .update(shStr)
        .digest(`hex`)

      const z = {
        id: createNodeId(`${node.id} [${idx}] >>> ${node.extension}`),
        children: [],
        parent: node.id,
        internal: {
          contentDigest,
          type: _.upperFirst(_.camelCase(`${node.name} ${node.extension}`)),
        },
      }
      createNode(z)
      createParentChildLink({ parent: node, child: z })
    }
  })

  return
}

exports.onCreateNode = onCreateNode
