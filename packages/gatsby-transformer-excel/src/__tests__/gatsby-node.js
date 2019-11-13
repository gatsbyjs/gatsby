const Promise = require(`bluebird`)
const XLSX = require(`xlsx`)

const { onCreateNode } = require(`../gatsby-node`)

describe(`Process nodes correctly`, () => {
  const node = {
    id: `whatever`,
    parent: null,
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
    const data = [
      [`blue`, `funny`],
      [true, `yup`],
      [false, `nope`],
    ]
    const csv = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(data))
    node.content = csv

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const actions = { createNode, createParentChildLink }
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)
    const createContentDigest = jest.fn().mockReturnValue(`contentDigest`)

    await onCreateNode({
      node,
      loadNodeContent,
      actions,
      createNodeId,
      createContentDigest,
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(2 + 1)
      expect(createParentChildLink).toHaveBeenCalledTimes(2 + 1)
      expect(createContentDigest).toHaveBeenCalledTimes(2 + 1)
    })
  })

  it(`should correctly create nodes from JSON with raw option false`, async () => {
    const data = [
      [`red`, `veryfunny`],
      [true, `certainly`],
      [false, `nada`],
    ]
    const csv = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(data))
    node.content = csv

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const actions = { createNode, createParentChildLink }
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)
    const createContentDigest = jest.fn().mockReturnValue(`contentDigest`)

    await onCreateNode(
      {
        node,
        loadNodeContent,
        actions,
        createNodeId,
        createContentDigest,
      },
      { raw: false }
    ).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(2 + 1)
      expect(createParentChildLink).toHaveBeenCalledTimes(2 + 1)
      expect(createContentDigest).toHaveBeenCalledTimes(2 + 1)
    })
  })

  it(`should correctly create nodes from JSON with legacy rawOutput option false`, async () => {
    const data = [
      [`red`, `veryfunny`],
      [true, `certainly`],
      [false, `nada`],
    ]
    const csv = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(data))
    node.content = csv

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const actions = { createNode, createParentChildLink }
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)
    const createContentDigest = jest.fn().mockReturnValue(`contentDigest`)

    await onCreateNode(
      {
        node,
        loadNodeContent,
        actions,
        createNodeId,
        createContentDigest,
      },
      { rawOutput: false }
    ).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(2 + 1)
      expect(createParentChildLink).toHaveBeenCalledTimes(2 + 1)
      expect(createContentDigest).toHaveBeenCalledTimes(2 + 1)
    })
  })
})
