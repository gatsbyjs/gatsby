import { store } from "../../../redux"
import { build } from "../../index"
import {
  DEFAULT_PIXEL_DENSITIES,
  DEFAULT_BREAKPOINTS,
} from "../remote-file-interface"

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
  const chunks = url.split(`/`)
  return {
    url: Buffer.from(chunks[3], `base64`).toString(),
    params: Buffer.from(chunks[4], `base64`).toString(),
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

    await build({})
    schema = store.getState().schema
  })

  describe(`resize`, () => {
    let resize
    const remoteFile = {
      url: `https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=640`,
      contentType: `image/jpg`,
      filename: `pauline-loroy-U3aF7hgUSrk-unsplash.jpg`,
      width: 1200,
      height: 800,
    }

    beforeAll(() => {
      const fields = schema.getType(`RemoteFile`).getFields()
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
      const { url, params } = extractImageChunks(data)

      expect(url).toEqual(remoteFile.url)
      expect(params).toMatchInlineSnapshot(`"w=100&h=100&fm=jpg"`)
      expect(data).toMatchInlineSnapshot(
        `"/_gatsby/image/aHR0cHM6Ly9pbWFnZXMudW5zcGxhc2guY29tL3Bob3RvLTE1ODczMDAwMDMzODgtNTkyMDhjYzk2MmNiP2l4bGliPXJiLTEuMi4xJnE9ODAmZm09anBnJmNyb3A9ZW50cm9weSZjcz10aW55c3JnYiZ3PTY0MA==/dz0xMDAmaD0xMDAmZm09anBn"`
      )
    })
  })

  describe(`getImageData`, () => {
    let gatsbyImageData
    const remoteFile = {
      url: `https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=640`,
      contentType: `image/jpg`,
      filename: `pauline-loroy-U3aF7hgUSrk-unsplash.jpg`,
      width: 1200,
      height: 800,
    }

    beforeAll(() => {
      const fields = schema.getType(`RemoteFile`).getFields()
      gatsbyImageData = fields.gatsbyImageData.resolve
    })

    it(`should get the correct fixed sizes`, async () => {
      const data = await gatsbyImageData(
        remoteFile,
        {
          layout: `fixed`,
          formats: [`auto`],
          width: 100,
          outputPixelDensities: DEFAULT_PIXEL_DENSITIES,
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
            descriptor: `100w`,
          },
          {
            url: remoteFile.url,
            params: expect.stringContaining(`w=200&h=133`),
            descriptor: `200w`,
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
          outputPixelDensities: DEFAULT_PIXEL_DENSITIES,
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
          outputPixelDensities: DEFAULT_PIXEL_DENSITIES,
          breakpoints: DEFAULT_BREAKPOINTS,
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
