const { downloadContentfulAssets } = require(`../download-contentful-assets`)

jest.mock(`gatsby-source-filesystem`, () => {
  return {
    createRemoteFileNode: jest.fn(({ url }) => {
      return {
        url,
      }
    }),
  }
})

const reporter = {
  createProgress: jest.fn(() => {
    return {
      start: jest.fn(),
      tick: jest.fn(),
    }
  }),
}

const fixtures = [
  {
    id: `aa1beda4-b14a-50f5-89a8-222992a46a41`,
    contentful_id: `idJjXOxmNga8CSnQGEwTw`,
    internal: {
      owner: `gatsby-source-contentful`,
      type: `ContentfulAsset`,
    },
    title: `TundraUS`,
    node_locale: `en-US`,
    file: {
      url: `//images.ctfassets.net/testing/us-image.jpeg`,
    },
    localFile: {
      base: `us-image.jpeg`,
    },
  },
  {
    id: `586c12ca-fbe3-5acd-94ee-7598bf3f6d77`,
    contentful_id: `idJjXOxmNga8CSnQGEwTw`,
    internal: {
      owner: `gatsby-source-contentful`,
      type: `ContentfulAsset`,
    },
    title: `TundraFR`,
    node_locale: `fr`,
    file: {
      url: `//images.ctfassets.net/testing/fr-image.jpg`,
    },
    localFile: {
      base: `fr-image.jpg`,
    },
  },
]

describe.only(`downloadContentfulAssets`, () => {
  it(`derives unique cache key from node locale and id`, async () => {
    const cache = {
      get: jest.fn(() => Promise.resolve(null)),
      set: jest.fn(() => Promise.resolve(null)),
    }
    await downloadContentfulAssets({
      actions: { touchNode: jest.fn() },
      getNodesByType: () => fixtures,
      cache,
      assetDownloadWorkers: 50,
      reporter,
    })

    fixtures.forEach(n => {
      expect(cache.get).toHaveBeenCalledWith(
        `contentful-asset-${n.contentful_id}-${n.node_locale}`
      )
      expect(cache.set).toHaveBeenCalledWith(
        `contentful-asset-${n.contentful_id}-${n.node_locale}`,
        expect.anything()
      )
    })
  })
})
