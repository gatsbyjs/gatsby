import path from "path"
import importFrom from "import-from"
import { resizeResolver } from "../index"
import * as dispatchers from "../jobs/dispatchers"
import type { Store } from "gatsby"
import type { ImageFit, IRemoteImageNode } from "../types"
// import { fetchRemoteFile } from "gatsby-core-utils/fetch-remote-file"

jest.spyOn(dispatchers, `shouldDispatch`).mockImplementation(() => false)
jest.mock(`import-from`)

describe(`resizeResolver`, () => {
  beforeEach(() => {
    dispatchers.shouldDispatch.mockClear()
  })

  const store = {} as Store
  const portraitSource = {
    id: `1`,
    url: `https://images.unsplash.com/photo-1588795945-b9c8d9f9b9c7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80`,
    width: 600,
    height: 962,
    mimeType: `image/jpeg`,
    filename: `dog-portrait.jpg`,
    parent: null,
    children: [],
    internal: {
      type: `Test`,
      owner: `test`,
      contentDigest: `1`,
    },
  }
  const landscapeSource = {
    id: `2`,
    url: `https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80`,
    width: 600,
    height: 400,
    mimeType: `image/jpeg`,
    filename: `dog-landscape.jpg`,
    parent: null,
    children: [],
    internal: {
      type: `Test`,
      owner: `test`,
      contentDigest: `1`,
    },
  }

  const portrait = [
    `portrait`,
    portraitSource,
    {
      widthOnly: [300, 481],
      heightOnly: [187, 300],
      widthWithFit: [
        [`cover`, 300, 481],
        [`fill`, 300, 962],
        [`outside`, 300, 481],
        [`contain`, 300, 481],
      ],
      heightWithFit: [
        [`cover`, 187, 300],
        [`fill`, 600, 300],
        [`outside`, 187, 300],
        [`contain`, 187, 300],
      ],
      bothWithFit: [
        [`cover`, 300, 300],
        [`fill`, 300, 300],
        [`outside`, 300, 481],
        [`contain`, 300, 300],
      ],
    },
  ]

  const landscape = [
    `landscape`,
    landscapeSource,
    {
      widthOnly: [300, 200],
      heightOnly: [450, 300],
      widthWithFit: [
        [`cover`, 300, 200],
        [`fill`, 300, 400],
        [`outside`, 300, 200],
        [`contain`, 300, 200],
      ],
      heightWithFit: [
        [`cover`, 450, 300],
        [`fill`, 600, 300],
        [`outside`, 450, 300],
        [`contain`, 450, 300],
      ],
      bothWithFit: [
        [`cover`, 300, 300],
        [`fill`, 300, 300],
        [`outside`, 450, 300],
        [`contain`, 300, 300],
      ],
    },
  ]

  it(`should return null when source is not an image`, async () => {
    expect(
      await resizeResolver(
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
        {
          width: 100,
        },
        store
      )
    ).toBe(null)
    expect(dispatchers.shouldDispatch).not.toHaveBeenCalled()
  })

  it(`should allow you to change the format of the file`, async () => {
    const result = await resizeResolver(
      portraitSource,
      {
        width: 100,
        format: `webp`,
      },

      store
    )
    expect(result.src).toMatch(/\.webp$/)
  })

  it(`should fail when wrong format is given`, async () => {
    await expect(
      resizeResolver(
        portraitSource,
        {
          width: 100,
          format: `unknown`,
        },
        store
      )
    ).rejects.toThrowError(
      `Unknown format "unknown" was given to resize ${portraitSource.url}`
    )
  })

  it(`should fail when no height or width is given`, async () => {
    await expect(
      resizeResolver(portraitSource, {}, store)
    ).rejects.toThrowError(
      `No width or height is given to resize "${portraitSource.url}"`
    )
  })

  it(`should add cropFocus when it's set`, async () => {
    const result = await resizeResolver(
      portraitSource,
      {
        width: 100,
        cropFocus: [`top`, `left`],
      },
      store
    )

    const [, , , , args] = result?.src.split(`/`) ?? []
    const [transformArgs] = args.split(`.`)
    const transformAsArgs = Buffer.from(transformArgs, `base64`).toString()
    expect(transformAsArgs).toContain(`fit=crop`)
    expect(transformAsArgs).toContain(`crop=top,left`)
  })

  describe.each([portrait, landscape] as Array<
    [
      string,
      IRemoteImageNode,
      {
        widthOnly: [number, number]
        heightOnly: [number, number]
        widthWithFit: Array<[ImageFit, number, number]>
        heightWithFit: Array<[ImageFit, number, number]>
        bothWithFit: Array<[ImageFit, number, number]>
      }
    ]
  >)(`%s image`, (type, source, expected) => {
    it(`should resize an image when width is given`, async () => {
      const result = await resizeResolver(
        source,
        {
          width: 300,
        },
        store
      )

      const [, , , url, args] = result?.src.split(`/`) ?? []
      const [transformArgs] = args.split(`.`)
      expect(Buffer.from(url, `base64`).toString()).toBe(source.url)
      expect(Buffer.from(transformArgs, `base64`).toString()).toBe(
        `w=${expected.widthOnly[0]}&h=${expected.widthOnly[1]}&fm=jpg`
      )
      expect(result?.width).toBe(expected.widthOnly[0])
      expect(result?.height).toBe(expected.widthOnly[1])
    })

    it(`should resize an image when height is given`, async () => {
      const result = await resizeResolver(
        source,
        {
          height: 300,
        },
        store
      )

      const [, , , url, args] = result?.src.split(`/`) ?? []
      const [transformArgs] = args.split(`.`)
      expect(Buffer.from(url, `base64`).toString()).toBe(source.url)
      expect(Buffer.from(transformArgs, `base64`).toString()).toBe(
        `w=${expected.heightOnly[0]}&h=${expected.heightOnly[1]}&fm=jpg`
      )
      expect(result?.width).toBe(expected.heightOnly[0])
      expect(result?.height).toBe(expected.heightOnly[1])
    })

    it.each(expected.widthWithFit)(
      `should resize an image correctly when width is given with fit as %s`,
      async (fit, expectedWidth, expectedHeight) => {
        const result = await resizeResolver(
          source,
          {
            width: 300,
            fit,
          },
          store
        )

        expect(result?.width).toBe(expectedWidth)
        expect(result?.height).toBe(expectedHeight)
      }
    )

    it.each(expected.heightWithFit)(
      `should resize an image correctly when height is given with fit as %s`,
      async (fit, expectedWidth, expectedHeight) => {
        const result = await resizeResolver(
          source,
          {
            height: 300,
            fit,
          },
          store
        )

        expect(result?.width).toBe(expectedWidth)
        expect(result?.height).toBe(expectedHeight)
      }
    )

    it.each(expected.bothWithFit)(
      `should resize an image correctly when width and height is given with fit as %s`,
      async (fit, expectedWidth, expectedHeight) => {
        const result = await resizeResolver(
          source,
          {
            width: 300,
            height: 300,
            fit,
          },
          store
        )

        expect(result?.width).toBe(expectedWidth)
        expect(result?.height).toBe(expectedHeight)
      }
    )
  })

  it(`should dispatch a job`, () => {
    const actions = {
      createJobV2: jest.fn(() => jest.fn()),
    }
    dispatchers.shouldDispatch.mockImplementationOnce(() => true)
    importFrom.mockImplementation(() => actions)

    resizeResolver(portraitSource, { width: 100 }, store)
    expect(actions.createJobV2).toHaveBeenCalledWith(
      expect.objectContaining({
        args: {
          contentDigest: `1`,
          url: portraitSource.url,
          filename: `${Buffer.from(`w=100&h=160&fm=jpg`).toString(
            `base64`
          )}.jpg`,
          format: `jpg`,
          width: 100,
          height: expect.any(Number),
        },
        inputPaths: [],
        name: `IMAGE_CDN`,
        outputDir: expect.stringContaining(
          path.join(
            `public`,
            `_gatsby`,
            `image`,
            Buffer.from(portraitSource.url).toString(`base64`)
          )
        ),
      }),
      expect.any(Object)
    )
  })
})
