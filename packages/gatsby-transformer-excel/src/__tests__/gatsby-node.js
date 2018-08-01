const Promise = require(`bluebird`)
const XLSX = require(`xlsx`)

const { onCreateNode } = require(`../gatsby-node`)

describe(`Process  nodes correctly`, () => {
  const node = {
    id: `whatever`,
    parent: `SOURCE`,
    children: [],
    extension: `csv`,
    internal: {
      contentDigest: `whatever`,
      mediaType: `text/csv`,
    },
    name: `test`,
  }

  // Make some fake functions its expecting.
  const loadNodeContent = node => Promise.resolve(node.content)

  it(`correctly creates nodes from JSON which is an array of objects`, async () => {
    const data = [[`blue`, `funny`], [true, `yup`], [false, `nope`]]
    const csv = XLSX.utils.sheet_to_csv(
      XLSX.utils.aoa_to_sheet(data, { raw: true })
    )
    node.content = csv

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const actions = { createNode, createParentChildLink }
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)

    await onCreateNode({
      node,
      loadNodeContent,
      actions,
      createNodeId,
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(2 + 1)
      expect(createParentChildLink).toHaveBeenCalledTimes(2 + 1)
    })
  })
})
