/* eslint-disable @babel/no-invalid-this */
const Promise = require(`bluebird`)
const PDFParser = require(`pdf2json`)

function shouldOnCreateNode({ node }) {
  // Filter out non-pdf content
  return node.extension === `pdf`
}

const convertToJson = path =>
  new Promise((res, rej) => {
    const pdfParser = new PDFParser(this, 1)
    pdfParser.loadPDF(path)
    pdfParser
      .on(`pdfParser_dataReady`, pdfData => {
        res(pdfParser.getRawTextContent())
      })
      .on(`pdfParser_dataError`, errData => {
        rej(`PDF to JSON conversion failed!`)
      })
  })

async function onCreateNode({
  node,
  actions,
  createNodeId,
  createContentDigest,
}) {
  const { createNode, createParentChildLink } = actions

  const parsedContent = await convertToJson(node.absolutePath)

  const pdfNode = {
    id: createNodeId(`${node.id} >>> ${node.extension}`),
    children: [],
    parent: node.id,
    internal: {
      type: `pdf`,
    },
  }

  pdfNode.content = parsedContent
  pdfNode.internal.contentDigest = createContentDigest(pdfNode)

  createNode(pdfNode)
  createParentChildLink({ parent: node, child: pdfNode })
}

exports.shouldOnCreateNode = shouldOnCreateNode
exports.onCreateNode = onCreateNode
