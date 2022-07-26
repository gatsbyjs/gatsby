import { URL } from "url"
import { store } from "../../../redux"
import { actions } from "../../../redux/actions"
import { build } from "../../index"

interface ISrcsetImageChunk {
  url: string
  params: string
  descriptor: string
}

jest.mock(`gatsby/reporter`, () => {
  return {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    activityTimer: jest.fn(() => {
      return {
        start: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
      }
    }),
    phantomActivity: jest.fn(() => {
      return {
        start: jest.fn(),
        end: jest.fn(),
      }
    }),
  }
})

function extractImageChunks(url: string): {
  url: string
  params: string
} {
  const parsedURL = new URL(`https://gatsbyjs.com${url}`)

  return {
    url: parsedURL.searchParams.get(`u`) as string,
    params: parsedURL.searchParams.get(`a`) as string,
  }
}

function extractImageChunksFromSrcSet(
  srcSet: string
): Array<ISrcsetImageChunk> {
  const sources = srcSet.split(`,`)
  const sourceChunks: Array<ISrcsetImageChunk> = []
  for (const source of sources) {
    const [url, descriptor] = source.trim().split(` `)
    sourceChunks.push({
      ...extractImageChunks(url),
      descriptor: descriptor ?? ``,
    })
  }

  return sourceChunks
}

describe(`remote-file`, () => {
  let schema

  beforeAll(async () => {
    global.__GATSBY = {
      root: process.cwd(),
    }

    store.dispatch(
      actions.createTypes(`
      type MyAsset implements Node & RemoteFile {
        id: ID!
      }
    `)
    )

    await build({})
    schema = store.getState().schema
  })

  describe(`resize`, () => {
    let resize
    const remoteFile = {
      url: `https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=640`,
      mimeType: `image/jpg`,
      filename: `pauline-loroy-U3aF7hgUSrk-unsplash.jpg`,
      width: 1200,
      height: 800,
      internal: {
        contentDigest: `1`,
      },
    }

    beforeAll(() => {
      const fields = schema.getType(`MyAsset`).getFields()
      resize = fields.resize.resolve
    })

    it(`should resize the remote url`, async () => {
      const data = await resize(
        remoteFile,
        {
          width: 100,
          height: 100,
        },
        {},
        {}
      )
      const { url, params } = extractImageChunks(data.src)

      expect(url).toEqual(remoteFile.url)
      expect(params).toMatchInlineSnapshot(`"w=100&h=100&fm=jpg&q=75"`)
      expect(data).toMatchInlineSnapshot(`
        Object {
          "height": 100,
          "src": "/_gatsby/image/089c5250227072e75a690e7c21838ed7/1a3d5207b5ced4f39bbd3bbd1c1fa633/pauline-loroy-U3aF7hgUSrk-unsplash.jpg?u=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1587300003388-59208cc962cb%3Fixlib%3Drb-1.2.1%26q%3D80%26fm%3Djpg%26crop%3Dentropy%26cs%3Dtinysrgb%26w%3D640&a=w%3D100%26h%3D100%26fm%3Djpg%26q%3D75&cd=1",
          "width": 100,
        }
      `)
    })
  })

  describe(`getImageData`, () => {
    let gatsbyImageData
    const remoteFile = {
      url: `https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=640`,
      mimeType: `image/jpg`,
      filename: `pauline-loroy-U3aF7hgUSrk-unsplash.jpg`,
      width: 1200,
      height: 800,
      internal: {
        contentDigest: `1`,
      },
    }

    beforeAll(() => {
      const fields = schema.getType(`MyAsset`).getFields()
      gatsbyImageData = fields.gatsbyImage.resolve
    })

    it(`should get the correct fixed sizes`, async () => {
      const data = await gatsbyImageData(
        remoteFile,
        {
          layout: `fixed`,
          formats: [`auto`],
          width: 100,
        },
        {},
        {}
      )
      const { url: fallbackUrl, params: fallbackParams } = extractImageChunks(
        data.images.fallback.src
      )
      const extractedSrcSet = extractImageChunksFromSrcSet(
        data.images.fallback.srcSet
      )

      expect(fallbackUrl).toBe(remoteFile.url)
      expect(fallbackParams).toContain(`w=100&h=67`)
      expect(data.images.fallback.sizes).toBe(`100px`)
      expect(extractedSrcSet).toEqual(
        expect.arrayContaining([
          {
            url: remoteFile.url,
            params: expect.stringContaining(`w=100&h=67`),
            descriptor: `1x`,
          },
          {
            url: remoteFile.url,
            params: expect.stringContaining(`w=200&h=133`),
            descriptor: `2x`,
          },
        ])
      )
      expect(data.layout).toBe(`fixed`)
    })

    it(`should get the correct constrained sizes`, async () => {
      const data = await gatsbyImageData(
        remoteFile,
        {
          layout: `constrained`,
          formats: [`auto`],
          width: 100,
        },
        {},
        {}
      )
      const { url: fallbackUrl, params: fallbackParams } = extractImageChunks(
        data.images.fallback.src
      )
      const extractedSrcSet = extractImageChunksFromSrcSet(
        data.images.fallback.srcSet
      )

      expect(fallbackUrl).toBe(remoteFile.url)
      expect(fallbackParams).toContain(`w=25`)
      expect(data.images.fallback.sizes).toBe(`(min-width: 100px) 100px, 100vw`)
      expect(extractedSrcSet).toEqual(
        expect.arrayContaining([
          {
            url: remoteFile.url,
            params: expect.stringContaining(`w=25&h=17`),
            descriptor: `25w`,
          },
          {
            url: remoteFile.url,
            params: expect.stringContaining(`w=50`),
            descriptor: `50w`,
          },
          {
            url: remoteFile.url,
            params: expect.stringContaining(`w=100`),
            descriptor: `100w`,
          },
          {
            url: remoteFile.url,
            params: expect.stringContaining(`w=200`),
            descriptor: `200w`,
          },
        ])
      )
      expect(data.layout).toBe(`constrained`)
    })

    it(`should get the correct fullWidth sizes`, async () => {
      const data = await gatsbyImageData(
        remoteFile,
        {
          layout: `fullWidth`,
          formats: [`auto`],
          width: 100,
        },
        {},
        {}
      )
      const { url: fallbackUrl, params: fallbackParams } = extractImageChunks(
        data.images.fallback.src
      )
      const extractedSrcSet = extractImageChunksFromSrcSet(
        data.images.fallback.srcSet
      )

      expect(fallbackUrl).toBe(remoteFile.url)
      expect(fallbackParams).toContain(`w=750`)
      expect(data.images.fallback.sizes).toBe(`100vw`)
      expect(extractedSrcSet).toEqual(
        expect.arrayContaining([
          {
            url: remoteFile.url,
            params: expect.stringContaining(`w=750&h=500`),
            descriptor: `750w`,
          },
          {
            url: remoteFile.url,
            params: expect.stringContaining(`w=1080`),
            descriptor: `1080w`,
          },
          {
            url: remoteFile.url,
            params: expect.stringContaining(`w=1200`),
            descriptor: `1200w`,
          },
        ])
      )
      expect(data.layout).toBe(`fullWidth`)
    })
  })
})
