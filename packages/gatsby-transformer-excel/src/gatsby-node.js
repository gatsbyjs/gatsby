const XLSX = require(`xlsx`)
const fs = require(`fs-extra`)
const _ = require(`lodash`)

// read files as `binary` from file system
function _loadNodeContent(fileNode, fallback) {
  return fileNode.absolutePath
    ? fs.readFile(fileNode.absolutePath, `binary`)
    : fallback(fileNode)
}

const extensions = [
  `xls`,
  `xlsx`,
  `xlsm`,
  `xlsb`,
  `xml`,
  `xlw`,
  `xlc`,
  `csv`,
  `txt`,
  `dif`,
  `sylk`,
  `slk`,
  `prn`,
  `ods`,
  `fods`,
  `uos`,
  `dbf`,
  `wks`,
  `123`,
  `wq1`,
  `qpw`,
  `htm`,
  `html`,
]

function unstable_shouldOnCreateNode({ node }) {
  return extensions.includes((node.extension || ``).toLowerCase())
}

async function onCreateNode(
  { node, actions, loadNodeContent, createNodeId, createContentDigest },
  options = {}
) {
  if (!unstable_shouldOnCreateNode({ node })) {
    return
  }

  const { createNode, createParentChildLink } = actions

  // Load binary string
  const content = await _loadNodeContent(node, loadNodeContent)

  // accept *all* options to pass to the sheet_to_json function
  const xlsxOptions = options
  // alias legacy `rawOutput` to correct `raw` attribute if raw isn't already defined
  if (!_.has(xlsxOptions, `raw`) && _.has(xlsxOptions, `rawOutput`)) {
    xlsxOptions.raw = xlsxOptions.rawOutput
  }
  if (!_.has(xlsxOptions, `defval`) && _.has(xlsxOptions, `defaultValue`)) {
    xlsxOptions.defval = xlsxOptions.defaultValue
  }
  delete xlsxOptions.rawOutput
  delete xlsxOptions.defaultValue
  delete xlsxOptions.plugins

  // Parse
  const wb = XLSX.read(content, { type: `binary`, cellDates: true })
  wb.SheetNames.forEach((n, idx) => {
    const ws = wb.Sheets[n]
    const parsedContent = XLSX.utils.sheet_to_json(ws, xlsxOptions)

    if (_.isArray(parsedContent)) {
      const csvArray = parsedContent.map((obj, i) => {
        const contentDigest = createContentDigest(obj)
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
      const contentDigest = createContentDigest(shObj)
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

exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode
exports.onCreateNode = onCreateNode
