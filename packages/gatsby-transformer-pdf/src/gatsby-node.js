const Promise = require(`bluebird`)
const PDFParser = require(`pdf2json`)

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
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) {
  const { createNode, createParentChildLink } = actions

  // Filter out non-pdf content
  if (node.extension !== `pdf`) {
    return
  }

  let parsedContent = await convertToJson(node.absolutePath)

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

exports.onCreateNode = onCreateNode
