const { parse: json2csv } = require(`json2csv`)
const os = require(`os`)
const { cloneDeep } = require(`lodash`)

const { onCreateNode } = require(`../gatsby-node`)
const { typeNameFromDir, typeNameFromFile } = require(`../index`)

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
    const fields = [`blue`, `funny`]
    const data = [
      { blue: true, funny: `yup` },
      { blue: false, funny: `nope` },
    ]
    const csv = json2csv(data, { fields })
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
      expect(createNode).toHaveBeenCalledTimes(2)
      expect(createParentChildLink).toHaveBeenCalledTimes(2)
    })
  })

  it(`correctly handles the noheader option`, async () => {
    node.content = `blue,funny\ntrue,yup\nfalse,nope`

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
      { noheader: true }
    ).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(3)
      expect(createParentChildLink).toHaveBeenCalledTimes(3)
    })
  })

  it(`allows other extensions to be used for input files`, async () => {
    const tsvNode = cloneDeep(node)
    tsvNode.extension = `ksv`
    tsvNode.internal.mediaType = `text/ksv`
    tsvNode.content = `blue\tfunny\ntrue\tyup\nfalse\tnope`

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const actions = { createNode, createParentChildLink }
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)
    const createContentDigest = jest.fn().mockReturnValue(`contentDigest`)

    await onCreateNode(
      {
        node: tsvNode,
        loadNodeContent,
        actions,
        createNodeId,
        createContentDigest,
      },
      { noheader: true, extensions: [`ksv`], delimiter: `\t` }
    ).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(3)
      expect(createParentChildLink).toHaveBeenCalledTimes(3)
    })
  })

  it(`passes through the delimiter option`, async () => {
    const tsvNode = cloneDeep(node)
    tsvNode.extension = `tsv`
    tsvNode.internal.mediaType = `text/tsv`
    tsvNode.content = `blue\tfunny\ntrue\tyup\nfalse\tnope`

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const actions = { createNode, createParentChildLink }
    const createNodeId = jest.fn()
    createNodeId.mockReturnValue(`uuid-from-gatsby`)
    const createContentDigest = jest.fn().mockReturnValue(`contentDigest`)

    await onCreateNode(
      {
        node: tsvNode,
        loadNodeContent,
        actions,
        createNodeId,
        createContentDigest,
      },
      { noheader: true, extensions: [`tsv`], delimiter: `\t` }
    ).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(3)
      expect(createParentChildLink).toHaveBeenCalledTimes(3)
    })
  })

  it(`correctly handles the typeName option with the provided typeNameFromFile function`, async () => {
    node.name = `theQueryShouldMatch`
    node.content = `letter,number\na,65\nb,42\nc,23`

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
      { typeName: typeNameFromFile }
    ).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(3)
      expect(createParentChildLink).toHaveBeenCalledTimes(3)
    })
  })

  it(`correctly handles the typeName option with the provided typeNameFromDir function`, async () => {
    node.name = `theTypeWontBeThis`
    node.content = `letter,number\na,65\nb,42\nc,23`
    node.dir = `${os.tmpdir()}/foo/` // The type will be FooCsv
    node.internal.type = `File`

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
      { typeName: typeNameFromDir }
    ).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(3)
      expect(createParentChildLink).toHaveBeenCalledTimes(3)
    })
  })

  it(`correctly handles the typeName option with a custom function`, async () => {
    node.name = `theTypeWontBeThis`
    node.content = `letter,number\na,65\nb,42\nc,23`

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
      {
        typeName: ({ node, object }) => `CsvTypeSetByFunction`,
      }
    ).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(3)
      expect(createParentChildLink).toHaveBeenCalledTimes(3)
    })
  })

  it(`correctly handles the typeName option with a string`, async () => {
    node.name = `theTypeWontBeThis`
    node.content = `letter,number\na,65\nb,42\nc,23`

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
      {
        typeName: `CsvTypeSetByFunction`,
      }
    ).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(3)
      expect(createParentChildLink).toHaveBeenCalledTimes(3)
    })
  })

  it(`correctly handles the nodePerFile option in the false case`, async () => {
    node.name = `theTypeWillBeThis`
    node.content = `letter,number\na,65\nb,42\nc,23`

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
      {
        nodePerFile: false,
      }
    ).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(3)
      expect(createParentChildLink).toHaveBeenCalledTimes(3)
    })
  })

  it(`correctly handles the nodePerFile option in the true case`, async () => {
    node.name = `theTypeWillBeThis`
    node.content = `letter,number\na,65\nb,42\nc,23`

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
      {
        nodePerFile: true,
      }
    ).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(1)
      expect(createParentChildLink).toHaveBeenCalledTimes(1)
    })
  })

  it(`correctly handles the nodePerFile option in the string case`, async () => {
    node.name = `theTypeWillBeThis`
    node.content = `letter,number\na,65\nb,42\nc,23`

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
      {
        nodePerFile: `theItems`,
      }
    ).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(1)
      expect(createParentChildLink).toHaveBeenCalledTimes(1)
    })
  })
})
