const {
  readFile,
  read,
  utils: { sheet_to_json },
} = require(`xlsx`)
const { upperFirst, camelCase } = require(`lodash`)

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
  `numbers`,
]

function shouldOnCreateNode({ node }) {
  return extensions.includes((node.extension || ``).toLowerCase())
}

async function onCreateNode(
  { node, actions, loadNodeContent, createNodeId, createContentDigest },
  options = {}
) {
  const { createNode, createParentChildLink } = actions

  // accept *all* options to pass to the sheet_to_json function
  const xlsxOptions = options
  // alias legacy `rawOutput` to correct `raw` attribute if raw isn't already defined
  if (
    !Object.hasOwn(xlsxOptions, `raw`) &&
    Object.hasOwn(xlsxOptions, `rawOutput`)
  ) {
    xlsxOptions.raw = xlsxOptions.rawOutput
  }
  if (
    !Object.hasOwn(xlsxOptions, `defval`) &&
    Object.hasOwn(xlsxOptions, `defaultValue`)
  ) {
    xlsxOptions.defval = xlsxOptions.defaultValue
  }
  delete xlsxOptions.rawOutput
  delete xlsxOptions.defaultValue
  delete xlsxOptions.plugins

  // Parse
  const readOptions = { cellDates: true }
  const wb = node.absolutePath
    ? readFile(node.absolutePath, readOptions)
    : read(await loadNodeContent(node), { type: `binary`, ...readOptions })
  wb.SheetNames.forEach((n, idx) => {
    const ws = wb.Sheets[n]
    const parsedContent = sheet_to_json(ws, xlsxOptions)

    if (Array.isArray(parsedContent)) {
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
              upperFirst(camelCase(`${node.name} ${node.extension}`)) +
              `__` +
              upperFirst(camelCase(`${n}`)),
          },
        }
      })

      csvArray.forEach(y => {
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
          type: upperFirst(camelCase(`${node.name} ${node.extension}`)),
        },
      }
      createNode(z)
      createParentChildLink({ parent: node, child: z })
    }
  })

  return
}

exports.shouldOnCreateNode = shouldOnCreateNode
exports.onCreateNode = onCreateNode
