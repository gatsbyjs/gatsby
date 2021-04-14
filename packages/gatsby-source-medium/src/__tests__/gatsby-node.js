const axios = require(`axios`)
const { sourceNodes } = require(`../gatsby-node`)

const fixture = require(`./__fixtures__/medium.json`)
const fakeMediumData = `])}while(1);</x>${JSON.stringify(fixture)}`

jest.mock(`axios`)

describe(`gatsby-source-medium`, () => {
  describe(`sourceNodes`, () => {
    let actions
    let createNodeId
    let createContentDigest
    beforeEach(() => {
      axios.get.mockResolvedValue({ data: fakeMediumData })
      actions = {
        createNode: jest.fn(),
      }
      createNodeId = jest.fn(id => id)
      createContentDigest = jest.fn().mockReturnValue(`digest`)
    })

    it(`should create node based on medium data`, async () => {
      await sourceNodes(
        { actions, createNodeId, createContentDigest },
        { username: `foo`, limit: 5 }
      )
      expect(actions.createNode).toBeCalled()
      expect(actions.createNode.mock.calls).toMatchSnapshot()
    })

    it(`should call medium api with username and limit`, async () => {
      const username = `foo`
      const limit = 5
      await sourceNodes(
        { actions, createNodeId, createContentDigest },
        { username, limit }
      )
      expect(axios.get).toBeCalledWith(
        `https://medium.com/${username}/?format=json&limit=${limit}`
      )
    })
  })
})
