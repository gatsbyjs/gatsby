const Promise = require(`bluebird`)
const _ = require(`lodash`)

const { onCreateNode } = require(`../gatsby-node`)

describe(`Process markdown content correctly`, () => {
  const node = {
    id: `whatever`,
    children: [],
    internal: {
      contentDigest: `whatever`,
      mediaType: `text/markdown`,
    },
  }

  // Make some fake functions its expecting.
  const loadNodeContent = node => Promise.resolve(node.content)

  it(`Correctly creates a new MarkdownRemark node`, async () => {
    const content = `---
title: "my little pony"
date: "2017-09-18T23:19:51.246Z"
---

Where oh where is my little pony?
    `
    node.content = content

    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const boundActionCreators = { createNode, createParentChildLink }

    await onCreateNode({
      node,
      loadNodeContent,
      boundActionCreators,
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(
        _.isString(createNode.mock.calls[0][0].frontmatter.date)
      ).toBeTruthy()
      expect(createParentChildLink.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(1)
      expect(createParentChildLink).toHaveBeenCalledTimes(1)
    })
  })
})
