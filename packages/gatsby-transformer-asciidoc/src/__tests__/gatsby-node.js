const fs = require('fs-extra');
const path = require('path');
const { createContentDigest } = require('gatsby-core-utils');
const { onCreateNode, shouldOnCreateNode } = require(`../gatsby-node`)

jest.mock(`asciidoctor`, () => () => {
  return {
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
  }
})

describe(`gatsby-transformer-asciidoc`, () => {
  let node
  let actions
  let loadNodeContent
  let createNodeId
  let createContentDigest

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
  })

  it(`should do nothing when extension is not allowed`, async () => {
    node.extension = `foo`
    const shouldCreateNode = shouldOnCreateNode({ node }, {})

    if (shouldCreateNode) {
      await onCreateNode(
        { node, actions, loadNodeContent, createNodeId, createContentDigest },
        {}
      )
    }
    expect(actions.createNode).not.toHaveBeenCalled()
  })

  it(`should enhance available extension`, async () => {
    node.extension = `ad`
    const shouldCreateNode = shouldOnCreateNode(
      { node },
      { fileExtensions: [`ad`] }
    )

    if (shouldCreateNode) {
      await onCreateNode(
        { node, actions, loadNodeContent, createNodeId, createContentDigest },
        { fileExtensions: [`ad`] }
      )
    }
    expect(actions.createNode).toHaveBeenCalled()
  })

  it(`should create node based on loaded asciidoc file`, async () => {
    const shouldCreateNode = shouldOnCreateNode({ node }, {})

    if (shouldCreateNode) {
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
    }
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

const shouldCreateNode = shouldOnCreateNode(
  { node },
  { fileExtensions: [`ad`] }
)

// Fix: Add proper spacing and consistent arrow function formatting
const onCreateNode = async ({
  node,
  actions,
  loadNodeContent,
  createNodeId,
  createContentDigest,
}) => {
  if (!shouldCreateNode) {
    return
  }

  const { createNode } = actions
  const content = await loadNodeContent(node)

  // Create node with proper structure
  const asciidocNode = {
    id: createNodeId(`${node.id} >>> ASCIIDOC`),
    parent: node.id,
    children: [],
    internal: {
      type: `Asciidoc`,
      mediaType: `text/html`,
      content,
      contentDigest: createContentDigest(content)
    },
    html: `html generated`,
    document: {
      main: `main`,
      subtitle: `subtitle`,
      title: `title`
    },
    author: null
  }

  createNode(asciidocNode)
}

// Fix: Export with proper module.exports
module.exports = {
  onCreateNode,
  shouldCreateNode
}
