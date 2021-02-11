const { sourceNodes } = require(`../gatsby-node`)
const { browse } = require(`../search`)
const got = require(`got`)

jest.mock(`../search`)
jest.mock(`got`)

describe(`gatsby-source-npm-package-search`, () => {
  describe(`sourceNodes`, () => {
    let actions
    let createNodeId
    let createContentDigest

    beforeEach(async () => {
      actions = {
        createNode: jest.fn(),
      }
      createNodeId = jest.fn(id => id)
      createContentDigest = jest.fn(() => `digest`)
    })

    describe(`with readme`, () => {
      beforeEach(async () => {
        browse.mockReturnValue([
          {
            objectID: `foo`,
            readme: `readme`,
          },
        ])
        await sourceNodes(
          {
            actions,
            createNodeId,
            createContentDigest,
          },
          {
            keywords: [`foo`, `bar`],
          }
        )
      })

      it(`should search with config keywords`, () => {
        expect(browse.mock.calls[0]).toMatchSnapshot()
      })

      it(`should create a package node for each search hit`, () => {
        expect(actions.createNode.mock.calls[0]).toMatchSnapshot()
      })

      it(`should create readme node for each search hit`, () => {
        expect(actions.createNode.mock.calls[1]).toMatchSnapshot()
      })
    })

    describe(`without readme`, () => {
      const packageName = `foo`
      beforeEach(async () => {
        browse.mockReturnValue([
          {
            objectID: packageName,
          },
        ])
        await sourceNodes(
          {
            actions,
            createNodeId,
            createContentDigest,
          },
          {
            keywords: [`foo`, `bar`],
          }
        )
      })

      it(`should fetch readme`, () => {
        expect(got.get).toBeCalledWith(
          `https://unpkg.com/${packageName}/README.md`
        )
      })
    })
  })
})
