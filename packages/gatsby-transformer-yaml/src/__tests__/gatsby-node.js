const Promise = require(`bluebird`)
const os = require(`os`)
const { onCreateNode } = require(`../gatsby-node`)

const createNodeId = jest.fn().mockReturnValue(`uuid-from-gatsby`)
const createContentDigest = jest.fn().mockReturnValue(`contentDigest`)

const loadNodeContent = node => Promise.resolve(node.content)

let createNode
let createParentChildLink
let actions
let node
let createNodeSpec

beforeEach(() => {
  createNode = jest.fn()
  createParentChildLink = jest.fn()
  actions = { createNode, createParentChildLink }

  node = {
    id: `whatever`,
    parent: null,
    children: [],
    internal: {
      contentDigest: `whatever`,
      mediaType: `text/yaml`,
    },
  }

  createNodeSpec = {
    node,
    loadNodeContent,
    actions,
    createNodeId,
    createContentDigest,
  }
})

const expectCreatedNodesMatchingSnapshot = count => {
  expect(createNode.mock.calls).toMatchSnapshot()
  expect(createParentChildLink.mock.calls).toMatchSnapshot()
  expect(createNode).toHaveBeenCalledTimes(count)
  expect(createParentChildLink).toHaveBeenCalledTimes(count)
}

const expectCreatedNodeTypeName = nodeTypeName => {
  expect(createNode).toBeCalledWith(
    expect.objectContaining({
      internal: expect.objectContaining({
        type: nodeTypeName,
      }),
    })
  )
}

describe(`Processing YAML nodes with internal type 'File'`, () => {
  beforeEach(() => {
    node.internal.type = `File`
    node.dir = `${os.tmpdir()}/top/foo bar/`
    node.name = `My File`
  })

  describe(`from a single YAML dictionary,`, () => {
    beforeEach(() => {
      node.content = `
            id: some
            blue: true
            funny: yup
      `
    })

    it(`when no target type name is specified, the type name is based on the directory name`, async () => {
      await onCreateNode(createNodeSpec)

      expectCreatedNodesMatchingSnapshot(1)
      expectCreatedNodeTypeName(`FooBarYaml`)
    })

    it(`with the specified target type name`, async () => {
      await onCreateNode(createNodeSpec, {
        typeName: `fixed`,
      })

      expectCreatedNodesMatchingSnapshot(1)
      expectCreatedNodeTypeName(`fixed`)
    })

    it(`with the target type name explicitly retrieved from the YAML content`, async () => {
      // noinspection JSUnusedLocalSymbols (unused fields left as documentation)
      await onCreateNode(createNodeSpec, {
        typeName: ({ node, object, isArray }) => object.funny,
      })

      expectCreatedNodesMatchingSnapshot(1)
      expectCreatedNodeTypeName(`yup`)
    })
  })

  describe(`from a YAML array of dictionaries,`, () => {
    beforeEach(() => {
      node.content = `
            - blue: true
              funny: yup
            - blue: false
              funny: nope
      `
    })

    it(`when no target type name is specified, all nodes have a type name based on the file name`, async () => {
      await onCreateNode(createNodeSpec)

      expectCreatedNodesMatchingSnapshot(2)
      expectCreatedNodeTypeName(`MyFileYaml`)
      expectCreatedNodeTypeName(`MyFileYaml`)
    })

    it(`with the specified target type name`, async () => {
      await onCreateNode(createNodeSpec, {
        typeName: `fixed`,
      })

      expectCreatedNodesMatchingSnapshot(2)
      expectCreatedNodeTypeName(`fixed`)
      expectCreatedNodeTypeName(`fixed`)
    })

    it(`with the target type name explicitly retrieved from the YAML content`, async () => {
      // noinspection JSUnusedLocalSymbols (unused fields left as documentation)
      await onCreateNode(createNodeSpec, {
        typeName: ({ node, object, isArray }) => object.funny,
      })

      expectCreatedNodesMatchingSnapshot(2)
      expectCreatedNodeTypeName(`yup`)
      expectCreatedNodeTypeName(`nope`)
    })
  })
})

describe(`Processing YAML nodes with internal type other than 'File'`, () => {
  beforeEach(() => {
    node.internal.type = `Other`
  })

  describe(`from a single YAML dictionary,`, () => {
    beforeEach(() => {
      node.content = `
            id: some
            blue: true
            funny: yup
      `
    })

    it(`when no target type name is specified, the type name is based on the original node's internal type`, async () => {
      await onCreateNode(createNodeSpec)

      expectCreatedNodesMatchingSnapshot(1)
      expectCreatedNodeTypeName(`OtherYaml`)
    })

    it(`with the specified target type name`, async () => {
      await onCreateNode(createNodeSpec, {
        typeName: `fixed`,
      })

      expectCreatedNodesMatchingSnapshot(1)
      expectCreatedNodeTypeName(`fixed`)
    })

    it(`with the target type name explicitly retrieved from the YAML content`, async () => {
      // noinspection JSUnusedLocalSymbols (unused fields left as documentation)
      await onCreateNode(createNodeSpec, {
        typeName: ({ node, object, isArray }) => object.funny,
      })

      expectCreatedNodesMatchingSnapshot(1)
      expectCreatedNodeTypeName(`yup`)
    })
  })

  describe(`from a YAML array of dictionaries,`, () => {
    beforeEach(() => {
      node.content = `
            - blue: true
              funny: yup
            - blue: false
              funny: nope
      `
    })

    it(`when no target type name is specified, all nodes have a type name based on the original node's internal type`, async () => {
      await onCreateNode(createNodeSpec)

      expectCreatedNodesMatchingSnapshot(2)
      expectCreatedNodeTypeName(`OtherYaml`)
      expectCreatedNodeTypeName(`OtherYaml`)
    })

    it(`with the specified target type name`, async () => {
      await onCreateNode(createNodeSpec, {
        typeName: `fixed`,
      })

      expectCreatedNodesMatchingSnapshot(2)
      expectCreatedNodeTypeName(`fixed`)
      expectCreatedNodeTypeName(`fixed`)
    })

    it(`with the target type name explicitly retrieved from the YAML content`, async () => {
      // noinspection JSUnusedLocalSymbols (unused fields left as documentation)
      await onCreateNode(createNodeSpec, {
        typeName: ({ node, object, isArray }) => object.funny,
      })

      expectCreatedNodesMatchingSnapshot(2)
      expectCreatedNodeTypeName(`yup`)
      expectCreatedNodeTypeName(`nope`)
    })
  })
})
