const { onCreateNode, shouldOnCreateNode } = require(`../gatsby-node`)

describe(`gatsby-transformer-javascript-frontmatter`, () => {
  describe(`onCreateNode`, () => {
    let node
    let actions
    let loadNodeContent
    let createContentDigest

    beforeEach(() => {
      node = {
        id: `foo`,
        extension: `js`,
        internal: {},
      }
      actions = {
        createNode: jest.fn(),
        createParentChildLink: jest.fn(),
      }
      loadNodeContent = jest.fn().mockReturnValue(`
        import React from "react"

        exports.frontmatter = {
          title: "Choropleth on d3v4",
          written: "2017-05-04",
          layoutType: "post",
          path: "choropleth-on-d3v4",
          category: ["data science", "data"],
          description: "Things about the choropleth.",
        }

        export default MyComponent
        `)
      createContentDigest = jest.fn().mockReturnValue(`digest`)
    })

    it.each`
      extension
      ${`js`}
      ${`jsx`}
      ${`ts`}
      ${`tsx`}
    `(
      `should loadNodeContent if file has extension $extension`,
      async ({ extension }) => {
        const shouldCreateNode = shouldOnCreateNode({
          node: {
            ...node,
            extension,
          },
        })

        if (shouldCreateNode) {
          await onCreateNode({
            node: {
              ...node,
              extension,
            },
            actions,
            loadNodeContent,
            createContentDigest,
          })
        }
        expect(loadNodeContent).toBeCalled()
      }
    )

    it(`should not loadNodeContent for not javascript file`, async () => {
      const shouldCreateNode = shouldOnCreateNode({
        node: {
          ...node,
          extension: `csv`,
        },
      })

      if (shouldCreateNode) {
        await onCreateNode({
          node: {
            ...node,
            extension: `csv`,
          },
          actions,
          loadNodeContent,
          createContentDigest,
        })
      }
      expect(loadNodeContent).not.toBeCalled()
    })

    it(`should load frontmatter data with exported object`, async () => {
      const shouldCreateNode = shouldOnCreateNode({ node })

      if (shouldCreateNode) {
        await onCreateNode({
          node,
          actions,
          loadNodeContent,
          createContentDigest,
        })
      }
      expect(actions.createNode).toBeCalled()
      expect(actions.createNode.mock.calls[0]).toMatchSnapshot()
    })

    it(`should load frontmatter data from named export`, async () => {
      loadNodeContent = jest.fn().mockReturnValue(`
          export const frontmatter = {
            title: "Choropleth on d3v4",
            written: "2017-05-04",
            layoutType: "post",
            path: "choropleth-on-d3v4",
            category: "data science",
            description: "Things about the choropleth.",
          }
        `)
      const shouldCreateNode = shouldOnCreateNode({ node })

      if (shouldCreateNode) {
        await onCreateNode({
          node,
          actions,
          loadNodeContent,
          createContentDigest,
        })
      }
      expect(actions.createNode).toBeCalled()
      expect(actions.createNode.mock.calls[0]).toMatchSnapshot()
    })

    it(`should pass fileAbsolutePath to node if file type is "File"`, async () => {
      node.internal.type = `File`
      node.absolutePath = `bar`
      const shouldCreateNode = shouldOnCreateNode({ node })

      if (shouldCreateNode) {
        await onCreateNode({
          node,
          actions,
          loadNodeContent,
          createContentDigest,
        })
      }
      expect(actions.createNode.mock.calls[0][0].fileAbsolutePath).toEqual(
        node.absolutePath
      )
    })
  })
})
