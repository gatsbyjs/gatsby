const Promise = require(`bluebird`)
const csv = require(`csvtojson`)
const _ = require(`lodash`)

const convertToJson = (data, options) =>
  new Promise((res, rej) => {
    csv(options)
      .fromString(data)
      .on(`end_parsed`, jsonData => {
        if (!jsonData) {
          rej(`CSV to JSON conversion failed!`)
        }
        res(jsonData)
      })
  })

async function onCreateNode(
  { node, actions, loadNodeContent, createNodeId, createContentDigest },
  options
) {
  const { createNode, createParentChildLink } = actions
  // Filter out non-csv content
  if (node.extension !== `csv`) {
    return
  }
  // Load CSV contents
  const content = await loadNodeContent(node)
  // Parse
  let parsedContent = await convertToJson(content, options)

  if (_.isArray(parsedContent)) {
    const csvArray = parsedContent.map((obj, i) => {
      return {
        ...obj,
        id: obj.id ? obj.id : createNodeId(`${node.id} [${i}] >>> CSV`),
        children: [],
        parent: node.id,
        internal: {
          contentDigest: createContentDigest(obj),
          // TODO make choosing the "type" a lot smarter. This assumes
          // the parent node is a file.
          // PascalCase
          type: _.upperFirst(_.camelCase(`${node.name} Csv`)),
        },
      }
    })

    _.each(csvArray, y => {
      createNode(y)
      createParentChildLink({ parent: node, child: y })
    })
  }

  return
}

exports.onCreateNode = onCreateNode
