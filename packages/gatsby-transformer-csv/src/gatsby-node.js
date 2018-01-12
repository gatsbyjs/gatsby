const Promise = require(`bluebird`)
const csv = require(`csvtojson`)
const _ = require(`lodash`)
const crypto = require(`crypto`)
const uuidv5 = require(`uuid/v5`)

const seedConstant = `c045f1f1-e335-425e-bc1b-694014b90b24`
const createId = (id) =>
  uuidv5(id, uuidv5(`csv`, seedConstant))

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
  { node, actions, loadNodeContent },
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
      const objStr = JSON.stringify(obj)
      const contentDigest = crypto
        .createHash(`md5`)
        .update(objStr)
        .digest(`hex`)

      return {
        ...obj,
        id: createId(obj.id ? obj.id : `${node.id} [${i}] >>> CSV`),
        children: [],
        parent: node.id,
        internal: {
          contentDigest,
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
