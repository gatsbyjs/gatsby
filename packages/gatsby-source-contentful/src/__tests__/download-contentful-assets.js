// @ts-check
import { downloadContentfulAssets } from "../download-contentful-assets"
import { createAssetNodes } from "../normalize"
import { createPluginConfig } from "../plugin-options"

const pluginConfig = createPluginConfig({})

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

const mockedContentfulEntity = {
  sys: { id: `mocked` },
}

const fixtures = [
  {
    id: `aa1beda4-b14a-50f5-89a8-222992a46a41`,
    internal: {
      owner: `gatsby-source-contentful`,
      type: `ContentfulAsset`,
    },
    fields: {
      title: { "en-US": `TundraUS`, fr: `TundraFR` },
      file: {
        "en-US": {
          url: `//images.ctfassets.net/testing/us-image.jpeg`,
          details: { size: 123, image: { width: 123, height: 123 } },
        },
        fr: {
          url: `//images.ctfassets.net/testing/fr-image.jpg`,
          details: { size: 123, image: { width: 123, height: 123 } },
        },
      },
    },
    sys: {
      id: `idJjXOxmNga8CSnQGEwTw`,
      type: `Asset`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      space: mockedContentfulEntity,
      environment: mockedContentfulEntity,
      revision: 123,
    },
  },
]

describe(`downloadContentfulAssets`, () => {
  it(`derives unique cache key from node locale and id`, async () => {
    const createNode = jest.fn(() => Promise.resolve())
    const createNodeId = jest.fn(id => id)
    const defaultLocale = `en-US`
    const locales = [{ code: `en-US` }, { code: `fr`, fallbackCode: `en-US` }]
    const space = mockedContentfulEntity

    const cache = {
      get: jest.fn(() => Promise.resolve(null)),
      set: jest.fn(() => Promise.resolve(null)),
    }

    const assetNodes = []
    for (const assetItem of fixtures) {
      assetNodes.push(
        ...(await Promise.all(
          createAssetNodes({
            assetItem,
            createNode,
            createNodeId,
            defaultLocale,
            locales,
            space,
            pluginConfig,
          })
        ))
      )
    }

    await downloadContentfulAssets({
      actions: { touchNode: jest.fn() },
      assetNodes,
      cache,
      assetDownloadWorkers: 50,
      reporter,
    })

    assetNodes.forEach(n => {
      expect(cache.get).toHaveBeenCalledWith(
        `contentful-asset-${n.sys.id}-${n.sys.locale}`
      )
      expect(cache.set).toHaveBeenCalledWith(
        `contentful-asset-${n.sys.id}-${n.sys.locale}`,
        expect.anything()
      )
    })
  })
})
