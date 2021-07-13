const mockAsciidoctor = {
  load: jest.fn(() => {
    return {
      hasRevisionInfo: jest.fn(),
      getAuthor: jest.fn(),
      getAttributes: jest.fn(() => {
        return {}
      }),
      getAttribute: jest.fn(),
      convert: jest.fn(() => `html generated`),
      getDocumentTitle: jest.fn(() => {
        return {
          getCombined: jest.fn(() => `title`),
          hasSubtitle: jest.fn(() => true),
          getSubtitle: jest.fn(() => `subtitle`),
          getMain: jest.fn(() => `main`),
        }
      }),
    }
  }),
  ConverterFactory: {},
  Extensions: {},
}

jest.mock(`asciidoctor`, () => () => mockAsciidoctor)

const path = require(`path`)
const { onCreateNode } = require(`../gatsby-node`)

describe(`gatsby-transformer-asciidoc`, () => {
  let node
  let actions
  let loadNodeContent
  let createNodeId
  let createContentDigest
  let register
  let create

  beforeEach(() => {
    node = {
      id: `dummy`,
      extension: `asciidoc`,
      dir: path.resolve(__dirname),
    }
    actions = {
      createNode: jest.fn(),
      createParentChildLink: jest.fn(),
    }
    loadNodeContent = jest.fn(node => node)
    createNodeId = jest.fn(node => node)
    createContentDigest = jest.fn(() => `digest`)
    register = jest.fn()
    create = jest.fn()
    mockAsciidoctor.ConverterFactory = {
      register,
    }
    mockAsciidoctor.Extensions = {
      create,
    }
  })

  it(`should load a CustomConverter`, async () => {
    const customConverter = jest.fn()
    await onCreateNode(
      { node, actions, loadNodeContent, createNodeId, createContentDigest },
      { converterFactory: jest.fn(() => customConverter) }
    )

    expect(register).toHaveBeenCalledWith(customConverter, [`html5`])
  })

  it(`should load MacroExtensions`, async () => {
    const macroExtensions = [jest.fn(), jest.fn()]
    const registry = jest.fn()
    create.mockImplementationOnce(() => registry)

    await onCreateNode(
      { node, actions, loadNodeContent, createNodeId, createContentDigest },
      { macroExtensions }
    )

    expect(macroExtensions[0]).toHaveBeenCalledWith(registry)
    expect(macroExtensions[1]).toHaveBeenCalledWith(registry)
    expect(mockAsciidoctor.load).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        extension_registry: registry,
      })
    )
  })

  it(`should do nothing when extension is not whitelisted`, async () => {
    node.extension = `foo`
    await onCreateNode(
      { node, actions, loadNodeContent, createNodeId, createContentDigest },
      {}
    )
    expect(actions.createNode).not.toHaveBeenCalled()
  })

  it(`should enhance available extension`, async () => {
    node.extension = `ad`
    await onCreateNode(
      { node, actions, loadNodeContent, createNodeId, createContentDigest },
      { fileExtensions: [`ad`] }
    )
    expect(actions.createNode).toHaveBeenCalled()
  })

  it(`should create node based on loaded asciidoc file`, async () => {
    await onCreateNode(
      {
        node,
        actions,
        loadNodeContent,
        createNodeId,
        createContentDigest,
      },
      {}
    )
    expect(actions.createNode).toHaveBeenCalledWith({
      author: null,
      children: [],
      document: { main: `main`, subtitle: `subtitle`, title: `title` },
      html: `html generated`,
      id: `dummy >>> ASCIIDOC`,
      internal: {
        contentDigest: `digest`,
        mediaType: `text/html`,
        type: `Asciidoc`,
      },
      pageAttributes: {},
      parent: `dummy`,
      revision: null,
    })
  })
})
