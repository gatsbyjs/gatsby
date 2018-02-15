jest.mock(`fs`)

describe(`Track root nodes`, () => {
  const reduxStatePath = `${process.cwd()}/.cache/redux-state.json`
  const MOCK_FILE_INFO = {}
  MOCK_FILE_INFO[reduxStatePath] = `
  {
      "nodes": {
          "id1": {
            "id": "id1",
            "parent": null,
            "children": [],
            "inlineObject": {
              "field": "fieldOfFirstNode"
            },
            "inlineArray": [
              1, 2, 3
            ],
            "internal": {
              "type": "TestNode",
              "contentDigest": "digest1",
              "owner": "test"
            }
          }
      }
  }
  `
  require(`fs`).__setMockFiles(MOCK_FILE_INFO)

  const { getNode, getNodes } = require(`../../redux`)
  const { findRootNode } = require(`../node-tracking`)
  const runSift = require(`../run-sift`)
  const buildNodeTypes = require(`../build-node-types`)
  const { boundActionCreators: { createNode } } = require(`../../redux/actions`)

  createNode(
    {
      id: `id2`,
      parent: null,
      children: [],
      inlineObject: {
        field: `fieldOfSecondNode`,
      },
      inlineArray: [1, 2, 3],
      internal: {
        type: `TestNode`,
        contentDigest: `digest2`,
      },
    },
    {
      name: `test`,
    }
  )

  describe(`Tracks nodes read from redux state cache`, () => {
    it(`Tracks inline objects`, () => {
      const node = getNode(`id1`)
      const inlineObject = node.inlineObject
      const trackedRootNode = findRootNode(inlineObject)

      expect(trackedRootNode).toEqual(node)
    })

    it(`Tracks inline arrays`, () => {
      const node = getNode(`id1`)
      const inlineObject = node.inlineArray
      const trackedRootNode = findRootNode(inlineObject)

      expect(trackedRootNode).toEqual(node)
    })

    it(`Doesn't track copied objects`, () => {
      const node = getNode(`id1`)
      const copiedInlineObject = { ...node.inlineObject }
      const trackedRootNode = findRootNode(copiedInlineObject)

      expect(trackedRootNode).not.toEqual(node)
    })
  })

  describe(`Tracks nodes created using createNode action`, () => {
    it(`Tracks inline objects`, () => {
      const node = getNode(`id2`)
      const inlineObject = node.inlineObject
      const trackedRootNode = findRootNode(inlineObject)

      expect(trackedRootNode).toEqual(node)
    })
  })

  describe(`Tracks nodes returned by running sift`, () => {
    let type, nodes

    beforeAll(async () => {
      type = (await buildNodeTypes()).testNode.nodeObjectType
      nodes = getNodes()
    })

    it(`Tracks objects when running query without filter`, async () => {
      const result = await runSift({
        args: {},
        nodes,
        type,
        connection: true,
      })

      expect(result.edges.length).toEqual(2)
      expect(findRootNode(result.edges[0].node.inlineObject)).toEqual(
        result.edges[0].node
      )
      expect(findRootNode(result.edges[1].node.inlineObject)).toEqual(
        result.edges[1].node
      )
    })

    it(`Tracks objects when running query with filter`, async () => {
      const result = await runSift({
        args: {
          filter: {
            inlineObject: {
              field: {
                eq: `fieldOfSecondNode`,
              },
            },
          },
        },
        nodes,
        type,
        connection: true,
      })

      expect(result.edges.length).toEqual(1)
      expect(findRootNode(result.edges[0].node.inlineObject)).toEqual(
        result.edges[0].node
      )
    })
  })
})
