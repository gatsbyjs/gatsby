import path from "path"
import { ensureDir, remove } from "fs-extra"
import importFrom from "import-from"
import { fetchRemoteFile } from "gatsby-core-utils/fetch-remote-file"
import { gatsbyImageResolver } from "../index"
import * as dispatchers from "../jobs/dispatchers"
import type { Actions } from "gatsby"
import { PlaceholderType } from "../placeholder-handler"

jest.spyOn(dispatchers, `shouldDispatch`).mockImplementation(() => false)
jest.mock(`import-from`)
jest.mock(`gatsby-core-utils/fetch-remote-file`, () => {
  return {
    fetchRemoteFile: jest.fn(),
  }
})
jest.mock(`gatsby-core-utils/mutex`, () => {
  return {
    createMutex: jest.fn(() => {
      return {
        acquire: jest.fn(() => Promise.resolve()),
        release: jest.fn(() => Promise.resolve()),
      }
    }),
  }
})

function parseSrcSet(
  srcSet: string
): Array<{ src: string; descriptor: string }> {
  return srcSet.split(`,`).map(line => {
    const [src, descriptor] = line.split(` `)

    return { src, descriptor }
  })
}

function base64Encode(s: string): string {
  return Buffer.from(s).toString(`base64`)
}

describe(`gatsbyImageData`, () => {
  const cacheDir = path.join(__dirname, `.cache`)

  beforeAll(async () => {
    await ensureDir(cacheDir)

    importFrom.mockReturnValue({
      getCache: jest.fn(() => {
        return {
          get: jest.fn(() => Promise.resolve()),
          set: jest.fn(() => Promise.resolve()),
          directory: cacheDir,
        }
      }),
    })
  })
  afterAll(() => remove(cacheDir))

  beforeEach(() => {
    dispatchers.shouldDispatch.mockClear()
    fetchRemoteFile.mockClear()
  })

  const actions = {} as Actions
  const portraitSource = {
    id: `1`,
    url: `https://images.unsplash.com/photo-1588795945-b9c8d9f9b9c7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80`,
    width: 600,
    height: 962,
    mimeType: `image/jpeg`,
    filename: `dog-portrait.jpg`,
    basename: `dog-portrait`,
    parent: null,
    children: [],
    internal: {
      type: `Test`,
      owner: `test`,
      contentDigest: `1`,
    },
  }

  it(`should return proper image props for aspect ratio and automatically add "fit" prop`, async () => {
    const result = await gatsbyImageResolver(
      portraitSource,
      {
        aspectRatio: 1.333333333,
        layout: `fixed`,
        width: 300,
        placeholder: `none`,
      },
      actions
    )

    const parsedSrcSet = parseSrcSet(result.images.sources[0].srcSet)

    expect(parsedSrcSet.length).toBe(2)

    expect(parsedSrcSet[0].src).toEqual(
      `/_gatsby/image/${base64Encode(portraitSource.url)}/${base64Encode(
        `w=300&h=225&fm=avif&q=75`
      )}/${portraitSource.basename}.avif`
    )
    expect(parsedSrcSet[0].descriptor).toEqual(`1x`)

    expect(parsedSrcSet[1].src).toEqual(
      `/_gatsby/image/${base64Encode(portraitSource.url)}/${base64Encode(
        `w=600&h=450&fm=avif&q=75`
      )}/${portraitSource.basename}.avif`
    )
    expect(parsedSrcSet[1].descriptor).toEqual(`2x`)
  })

  it(`should return proper image props for aspect ratio when "cropFocus" is also passed`, async () => {
    const result = await gatsbyImageResolver(
      portraitSource,
      {
        aspectRatio: 1.333333333,
        layout: `fixed`,
        width: 300,
        placeholder: `none`,
        cropFocus: [`entropy`],
      },
      actions
    )
    const parsedSrcSet = parseSrcSet(result.images.sources[0].srcSet)

    expect(parsedSrcSet[0].src).toEqual(
      `/_gatsby/image/${base64Encode(portraitSource.url)}/${base64Encode(
        `w=300&h=225&fit=crop&crop=entropy&fm=avif&q=75`
      )}/${portraitSource.basename}.avif`
    )
    expect(parsedSrcSet[0].descriptor).toEqual(`1x`)

    expect(parsedSrcSet[1].src).toEqual(
      `/_gatsby/image/${base64Encode(portraitSource.url)}/${base64Encode(
        `w=600&h=450&fit=crop&crop=entropy&fm=avif&q=75`
      )}/${portraitSource.basename}.avif`
    )
    expect(parsedSrcSet[1].descriptor).toEqual(`2x`)
  })

  it(`should return null when source is not an image`, async () => {
    expect(
      await gatsbyImageResolver(
        {
          id: `1`,
          url: `https://origin.com/my-pdf.pdf`,
          mimeType: `application/pdf`,
          filename: `my-pdf.pdf`,
          parent: null,
          children: [],
          internal: {
            type: `Test`,
            owner: `test`,
            contentDigest: `1`,
          },
        },
        // @ts-ignore - don't care
        {},
        actions
      )
    ).toBe(null)
    expect(dispatchers.shouldDispatch).not.toHaveBeenCalled()
  })

  it(`should return proper image props for fixed layout`, async () => {
    const result = await gatsbyImageResolver(
      portraitSource,
      {
        layout: `fixed`,
        width: 300,
        placeholder: `none`,
      },
      actions
    )

    const parsedSrcSet = parseSrcSet(result.images.sources[0].srcSet)
    expect(parsedSrcSet.length).toBe(2)
    expect(parsedSrcSet[0].src).toEqual(
      `/_gatsby/image/${Buffer.from(portraitSource.url).toString(
        `base64`
      )}/${Buffer.from(`w=300&h=481&fm=avif&q=75`).toString(`base64`)}/${
        portraitSource.basename
      }.avif`
    )
    expect(parsedSrcSet[0].descriptor).toEqual(`1x`)
    expect(parsedSrcSet[1].src).toEqual(
      `/_gatsby/image/${Buffer.from(portraitSource.url).toString(
        `base64`
      )}/${Buffer.from(`w=600&h=962&fm=avif&q=75`).toString(`base64`)}/${
        portraitSource.basename
      }.avif`
    )
    expect(parsedSrcSet[1].descriptor).toEqual(`2x`)

    expect(result).toEqual({
      height: 481,
      width: 300,
      layout: `fixed`,
      placeholder: undefined,
      backgroundColor: undefined,
      images: {
        fallback: {
          sizes: `300px`,
          src: expect.any(String),
          srcSet: expect.any(String),
        },
        sources: [
          {
            sizes: `300px`,
            srcSet: expect.any(String),
            type: `image/avif`,
          },
          {
            sizes: `300px`,
            srcSet: expect.any(String),
            type: `image/webp`,
          },
        ],
      },
    })
  })

  it(`should return proper image props for constrained layout`, async () => {
    const result = await gatsbyImageResolver(
      portraitSource,
      {
        layout: `constrained`,
        width: 300,
        placeholder: `none`,
      },
      actions
    )

    const parsedSrcSet = parseSrcSet(result.images.sources[0].srcSet)
    expect(parsedSrcSet.length).toBe(4)
    expect(parsedSrcSet[0].src).toEqual(
      `/_gatsby/image/${Buffer.from(portraitSource.url).toString(
        `base64`
      )}/${Buffer.from(`w=75&h=120&fm=avif&q=75`).toString(`base64`)}/${
        portraitSource.basename
      }.avif`
    )
    expect(parsedSrcSet[0].descriptor).toEqual(`75w`)
    expect(parsedSrcSet[1].src).toEqual(
      `/_gatsby/image/${Buffer.from(portraitSource.url).toString(
        `base64`
      )}/${Buffer.from(`w=150&h=241&fm=avif&q=75`).toString(`base64`)}/${
        portraitSource.basename
      }.avif`
    )
    expect(parsedSrcSet[1].descriptor).toEqual(`150w`)
    expect(parsedSrcSet[2].src).toEqual(
      `/_gatsby/image/${Buffer.from(portraitSource.url).toString(
        `base64`
      )}/${Buffer.from(`w=300&h=481&fm=avif&q=75`).toString(`base64`)}/${
        portraitSource.basename
      }.avif`
    )
    expect(parsedSrcSet[2].descriptor).toEqual(`300w`)
    expect(parsedSrcSet[3].src).toEqual(
      `/_gatsby/image/${Buffer.from(portraitSource.url).toString(
        `base64`
      )}/${Buffer.from(`w=600&h=962&fm=avif&q=75`).toString(`base64`)}/${
        portraitSource.basename
      }.avif`
    )
    expect(parsedSrcSet[3].descriptor).toEqual(`600w`)

    expect(result).toEqual({
      height: 481,
      width: 300,
      layout: `constrained`,
      placeholder: undefined,
      backgroundColor: undefined,
      images: {
        fallback: {
          sizes: `(min-width: 300px) 300px, 100vw`,
          src: expect.any(String),
          srcSet: expect.any(String),
        },
        sources: [
          {
            sizes: `(min-width: 300px) 300px, 100vw`,
            srcSet: expect.any(String),
            type: `image/avif`,
          },
          {
            sizes: `(min-width: 300px) 300px, 100vw`,
            srcSet: expect.any(String),
            type: `image/webp`,
          },
        ],
      },
    })
  })

  it(`should return proper image props for fullWidth layout`, async () => {
    const result = await gatsbyImageResolver(
      {
        ...portraitSource,
        width: 2000,
        height: 3206,
      },
      {
        layout: `fullWidth`,
        width: 2000,
        placeholder: `none`,
      },
      actions
    )

    const parsedSrcSet = parseSrcSet(result.images.sources[0].srcSet)
    expect(parsedSrcSet).toHaveLength(4)
    expect(parsedSrcSet[0].src).toEqual(
      `/_gatsby/image/${Buffer.from(portraitSource.url).toString(
        `base64`
      )}/${Buffer.from(`w=750&h=1202&fm=avif&q=75`).toString(`base64`)}/${
        portraitSource.basename
      }.avif`
    )
    expect(parsedSrcSet[0].descriptor).toEqual(`750w`)
    expect(parsedSrcSet[1].src).toEqual(
      `/_gatsby/image/${Buffer.from(portraitSource.url).toString(
        `base64`
      )}/${Buffer.from(`w=1080&h=1731&fm=avif&q=75`).toString(`base64`)}/${
        portraitSource.basename
      }.avif`
    )
    expect(parsedSrcSet[1].descriptor).toEqual(`1080w`)
    expect(parsedSrcSet[2].src).toEqual(
      `/_gatsby/image/${Buffer.from(portraitSource.url).toString(
        `base64`
      )}/${Buffer.from(`w=1366&h=2190&fm=avif&q=75`).toString(`base64`)}/${
        portraitSource.basename
      }.avif`
    )
    expect(parsedSrcSet[2].descriptor).toEqual(`1366w`)
    expect(parsedSrcSet[3].src).toEqual(
      `/_gatsby/image/${Buffer.from(portraitSource.url).toString(
        `base64`
      )}/${Buffer.from(`w=1920&h=3078&fm=avif&q=75`).toString(`base64`)}/${
        portraitSource.basename
      }.avif`
    )
    expect(parsedSrcSet[3].descriptor).toEqual(`1920w`)

    expect(result).toEqual({
      height: 3206,
      width: 2000,
      layout: `fullWidth`,
      placeholder: undefined,
      backgroundColor: undefined,
      images: {
        fallback: {
          sizes: `100vw`,
          src: expect.any(String),
          srcSet: expect.any(String),
        },
        sources: [
          {
            sizes: `100vw`,
            srcSet: expect.any(String),
            type: `image/avif`,
          },
          {
            sizes: `100vw`,
            srcSet: expect.any(String),
            type: `image/webp`,
          },
        ],
      },
    })
  })

  it(`should return proper srcSet from outputPixelDensities`, async () => {
    const fixedResult = await gatsbyImageResolver(
      portraitSource,
      {
        layout: `fixed`,
        width: 300,
        placeholder: `none`,
        outputPixelDensities: [1, 2],
      },
      actions
    )
    const constrainedResult = await gatsbyImageResolver(
      portraitSource,
      {
        layout: `constrained`,
        width: 300,
        placeholder: `none`,
        outputPixelDensities: [1, 2],
      },
      actions
    )
    const fullWidthResult = await gatsbyImageResolver(
      {
        ...portraitSource,
        width: 2000,
        height: 3206,
      },
      {
        layout: `fullWidth`,
        width: 300,
        placeholder: `none`,
        outputPixelDensities: [1, 2],
      },
      actions
    )

    const parsedFixedSrcSet = parseSrcSet(fixedResult.images.sources[0].srcSet)
    expect(parsedFixedSrcSet).toHaveLength(2)
    expect(parsedFixedSrcSet[0].src).toEqual(
      `/_gatsby/image/${Buffer.from(portraitSource.url).toString(
        `base64`
      )}/${Buffer.from(`w=300&h=481&fm=avif&q=75`).toString(`base64`)}/${
        portraitSource.basename
      }.avif`
    )
    expect(parsedFixedSrcSet[1].src).toEqual(
      `/_gatsby/image/${Buffer.from(portraitSource.url).toString(
        `base64`
      )}/${Buffer.from(`w=600&h=962&fm=avif&q=75`).toString(`base64`)}/${
        portraitSource.basename
      }.avif`
    )

    const parsedConstrainedSrcSet = parseSrcSet(
      constrainedResult.images.sources[0].srcSet
    )
    expect(parsedConstrainedSrcSet).toHaveLength(2)
    expect(parsedConstrainedSrcSet[0].src).toEqual(
      `/_gatsby/image/${Buffer.from(portraitSource.url).toString(
        `base64`
      )}/${Buffer.from(`w=300&h=481&fm=avif&q=75`).toString(`base64`)}/${
        portraitSource.basename
      }.avif`
    )
    expect(parsedConstrainedSrcSet[1].src).toEqual(
      `/_gatsby/image/${Buffer.from(portraitSource.url).toString(
        `base64`
      )}/${Buffer.from(`w=600&h=962&fm=avif&q=75`).toString(`base64`)}/${
        portraitSource.basename
      }.avif`
    )

    const parsedFullWidthSrcSet = parseSrcSet(
      fullWidthResult.images.sources[0].srcSet
    )
    expect(parsedFullWidthSrcSet).toHaveLength(4)
  })

  it(`Should url encode filenames`, async () => {
    const result = await gatsbyImageResolver(
      {
        ...portraitSource,
        filename: `name with spaces.jpeg`,
      },
      {
        width: 300,
        layout: `constrained`,
        placeholder: `none`,
      },
      actions
    )

    expect(result.images.fallback.src).not.toContain(` `)
    expect(result.images.fallback.src).toContain(`name%20with%20spaces`)
  })

  it(`should return proper srcSet from breakpoints only for fullWidth`, async () => {
    const biggerPortraitSource = {
      ...portraitSource,
      width: 2000,
      height: 3206,
    }
    const fixedResult = await gatsbyImageResolver(
      biggerPortraitSource,
      {
        layout: `fixed`,
        width: 300,
        placeholder: `none`,
        breakpoints: [350, 700],
      },
      actions
    )
    const constrainedResult = await gatsbyImageResolver(
      biggerPortraitSource,
      {
        layout: `constrained`,
        width: 300,
        placeholder: `none`,
        breakpoints: [350, 700],
      },
      actions
    )
    const fullWidthResult = await gatsbyImageResolver(
      biggerPortraitSource,
      {
        layout: `fullWidth`,
        width: 1000,
        placeholder: `none`,
        breakpoints: [350, 700],
      },
      actions
    )

    const parsedFixedSrcSet = parseSrcSet(fixedResult.images.sources[0].srcSet)
    expect(parsedFixedSrcSet).toHaveLength(2)
    expect(parsedFixedSrcSet[0].descriptor).toEqual(`1x`)
    const parsedConstrainedSrcSet = parseSrcSet(
      constrainedResult.images.sources[0].srcSet
    )
    expect(parsedConstrainedSrcSet).toHaveLength(4)
    expect(parsedConstrainedSrcSet[0].descriptor).toEqual(`75w`)

    const parsedFullWidthSrcSet = parseSrcSet(
      fullWidthResult.images.sources[0].srcSet
    )
    expect(parsedFullWidthSrcSet).toHaveLength(2)
    expect(parsedFullWidthSrcSet[0].descriptor).toEqual(`350w`)
    expect(parsedFullWidthSrcSet[1].descriptor).toEqual(`700w`)
  })

  it(`should generate dominant color placeholder by default`, async () => {
    fetchRemoteFile.mockResolvedValueOnce(
      path.join(__dirname, `__fixtures__`, `dog-portrait.jpg`)
    )
    const fixedResult = await gatsbyImageResolver(
      portraitSource,
      {
        layout: `fixed`,
        width: 300,
      },
      actions
    )

    expect(fetchRemoteFile).toHaveBeenCalledTimes(1)
    expect(fixedResult?.backgroundColor).toEqual(`rgb(56,40,40)`)
  })

  it(`should generate base64 placeholder`, async () => {
    fetchRemoteFile.mockResolvedValueOnce(
      path.join(__dirname, `__fixtures__`, `dog-portrait.jpg`)
    )
    const fixedResult = await gatsbyImageResolver(
      portraitSource,
      {
        layout: `fixed`,
        width: 300,
        placeholder: PlaceholderType.BLURRED,
      },
      actions
    )

    expect(fetchRemoteFile).toHaveBeenCalledTimes(1)
    expect(fetchRemoteFile).toHaveBeenCalledWith({
      url: portraitSource.url,
      cacheKey: `1`,
      directory: expect.stringContaining(cacheDir),
    })
    expect(fixedResult?.placeholder).toMatchInlineSnapshot(`
      Object {
        "fallback": "data:image/jpg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAhABQDASIAAhEBAxEB/8QAGQABAAMBAQAAAAAAAAAAAAAAAAQGBwUI/8QAMBAAAQMDAgQEAwkAAAAAAAAAAQIDBAAFEQYhEhMxUSJBYYEHNLEIFTIzUnGCkcH/xAAYAQADAQEAAAAAAAAAAAAAAAABAwQABf/EABwRAAICAwEBAAAAAAAAAAAAAAABAgMREkFRMf/aAAwDAQACEQMRAD8Aol31vIuGk59kf8RfuCLgFpUTwE54k79ACQQK1L7Nj0mdp+7sR3gH48hKgeYErCVp8XX1TWD6WjNO3RlU5h19C1JHJRuXCr8I7gFWM48q07VF2nWlpKtKsuW+W6sx1LbYaBeS2CSNhgDGFAdeo3pKs1mkxsqdq3g1LUC9PxLktu46iksycBSkKYCyP3INK8vXTVWoJEsuzpzheUBuppAJH9UqjafCZUV9LnprTsmNqKJMajyuQy6JHG+sJARjYq2xnbp2PerBNtDmp7eiPDcZQpl4OuK4vMpI6d9xn2rqX+6PuWp2MzHcaSvwFx9QOAfMYPXt61G03aJMK5OyUEBC1LXy1rBJSrBwdtiCM5B9DUDjJyT8OkrIqLIEf4bW8ND7yadkyP1tqWBjyG1KtqVunJUGSSc+Ikke+KU3MvSdtZOPe/kZH8PrXdb+XZ9v8pSt0D+Igvfmq9vpSlKIs//Z",
      }
    `)
  })

  it(`should render avif, webp other format in this order`, async () => {
    const constrainedResult = await gatsbyImageResolver(
      portraitSource,
      {
        layout: `constrained`,
        width: 300,
        placeholder: `none`,
        outputPixelDensities: [1, 2],
      },
      actions
    )

    expect(constrainedResult?.images.sources[0].type).toBe(`image/avif`)
    expect(constrainedResult?.images.sources[1].type).toBe(`image/webp`)
    expect(constrainedResult?.images.sources.length).toBe(2)
  })
})
