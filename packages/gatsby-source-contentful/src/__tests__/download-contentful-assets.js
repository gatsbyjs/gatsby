// @ts-check
import { downloadContentfulAssets } from "../download-contentful-assets"

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
    contentful_id: `idJjXOxmNga8CSnQGEwTw`,
    node_locale: `en-US`,
    file: {
      url: `//images.ctfassets.net/testing/us-image.jpeg`,
    },
  },
  {
    contentful_id: `idJjXOxmNga8CSnQGEwTw`,
    node_locale: `fr`,
    file: {
      url: `//images.ctfassets.net/testing/fr-image.jpg`,
    },
  },
]

describe(`downloadContentfulAssets`, () => {
  it(`derives unique cache key from node locale and id`, async () => {
    const cache = {
      get: jest.fn(() => Promise.resolve(null)),
      set: jest.fn(() => Promise.resolve(null)),
    }
    await downloadContentfulAssets({
      actions: { touchNode: jest.fn() },
      assetNodes: fixtures,
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
