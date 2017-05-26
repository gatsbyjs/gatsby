const Promise = require(`bluebird`)

const { onNodeCreate } = require(`../gatsby-node`)

describe(`Process markdown content correctly`, () => {
  const node = {
    id: `whatever`,
    children: [],
    internal: {
      contentDigest: `whatever`,
      mediaType: `text/x-markdown`,
    },
  }

  // Make some fake functions its expecting.
  const loadNodeContent = node => Promise.resolve(node.content)

  it(`Correctly creates a new MarkdownRemark node`, async () => {
    const content = `---
title: "my little pony"
date: "12/12/2014"
---

Where oh where is my little pony?
    `
    node.content = content

    const createNode = jest.fn()
    const addNodeToParent = jest.fn()
    const boundActionCreators = { createNode, addNodeToParent }

    await onNodeCreate({
      node,
      loadNodeContent,
      boundActionCreators,
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(addNodeToParent.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(1)
      expect(addNodeToParent).toHaveBeenCalledTimes(1)
    })
  })
})
