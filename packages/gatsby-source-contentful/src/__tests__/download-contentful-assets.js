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

const fixtures = [
  {
    sys: {
      id: `idJjXOxmNga8CSnQGEwTw`,
      type: `Asset`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    fields: {
      file: {
        "en-US": {
          url: `//images.ctfassets.net/testing/us-image.jpeg`,
        },
      },
    },
    title: {
      "en-US": `TundraUS`,
      fr: `TundraFR`,
    },
  },
]

describe(`downloadContentfulAssets`, () => {
  it(`derives unique cache key from node locale and id`, async () => {
    const createNode = jest.fn(() => Promise.resolve())
    const createNodeId = jest.fn(id => id)
    const defaultLocale = `en-US`
    const locales = [{ code: `en-US` }, { code: `fr`, fallbackCode: `en-US` }]
    const space = {
      sys: {
        id: `1234`,
      },
    }

    const cache = {
      get: jest.fn(() => Promise.resolve(null)),
      set: jest.fn(() => Promise.resolve(null)),
    }

    const assetNodes = []
    for (const assetItem of fixtures) {
      assetNodes.push(
        ...(await createAssetNodes({
          assetItem,
          createNode,
          createNodeId,
          defaultLocale,
          locales,
          space,
          pluginConfig,
        }))
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
        `contentful-asset-${n.contentful_id}-${n.node_locale}`
      )
      expect(cache.set).toHaveBeenCalledWith(
        `contentful-asset-${n.contentful_id}-${n.node_locale}`,
        expect.anything()
      )
    })
  })
})
