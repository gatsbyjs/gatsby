// @ts-check
import { createRemoteFileNode } from "gatsby-source-filesystem"

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

const defaultCreateRemoteFileNode = createRemoteFileNode.getMockImplementation()

afterEach(() => {
  createRemoteFileNode.mockImplementation(defaultCreateRemoteFileNode)
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

  it(`waits for every download to settle before surfacing a failure`, async () => {
    const failing = `//images.ctfassets.net/testing/broken.jpeg`
    const slowCount = 4
    let settled = 0

    createRemoteFileNode.mockImplementation(async ({ url }) => {
      if (url.includes(`broken`)) {
        throw new Error(
          `ENOENT: no such file or directory, lstat 'tmp-abc.jpeg'`
        )
      }

      await new Promise(resolve => setTimeout(resolve, 50))
      settled++
      return { url }
    })

    const assetNodes = [
      { contentful_id: `broken`, node_locale: `en-US`, file: { url: failing } },
      ...Array.from({ length: slowCount }, (_, i) => {
        return {
          contentful_id: `slow-${i}`,
          node_locale: `en-US`,
          file: { url: `//images.ctfassets.net/testing/slow-${i}.jpeg` },
        }
      }),
    ]

    await expect(
      downloadContentfulAssets({
        actions: { touchNode: jest.fn(), createNodeField: jest.fn() },
        assetNodes,
        cache: {
          get: jest.fn(() => Promise.resolve(null)),
          set: jest.fn(() => Promise.resolve(null)),
        },
        createNodeId: jest.fn(id => id),
        assetDownloadWorkers: 50,
        reporter,
      })
      // The failure is still fatal, and it is the original error.
    ).rejects.toThrow(`ENOENT`)

    // Without settling, the siblings would still be downloading here and would
    // create nodes after sourceNodes had already returned.
    expect(settled).toBe(slowCount)
  })
})
