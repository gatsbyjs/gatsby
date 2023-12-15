/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import path from "path"
import { createContentDigest } from "gatsby-core-utils/create-content-digest"
import { URL, URLSearchParams } from "url"
import { resizeResolver } from "../index"
import { generateImageUrl } from "../utils/url-generator"
import * as dispatchers from "../jobs/dispatchers"
import type { Actions } from "gatsby"
import type { ImageFit, IRemoteImageNode } from "../types"

jest
  .spyOn(dispatchers, `shouldDispatchLocalImageServiceJob`)
  .mockImplementation(() => false)

describe(`resizeResolver`, () => {
  beforeEach(() => {
    dispatchers.shouldDispatchLocalImageServiceJob.mockClear()
  })

  const actions = {} as Actions
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
        actions
      )
    ).toBe(null)
    expect(
      dispatchers.shouldDispatchLocalImageServiceJob
    ).not.toHaveBeenCalled()
  })

  it(`should allow you to change the format of the file`, async () => {
    const result = await resizeResolver(
      portraitSource,
      {
        width: 100,
        format: `webp`,
      },

      actions
    )
    expect(result.src.split(`?`)[0]).toMatch(/\.webp$/)
  })

  it(`should fail when wrong format is given`, async () => {
    await expect(
      resizeResolver(
        portraitSource,
        {
          width: 100,
          format: `unknown`,
        },
        actions
      )
    ).rejects.toThrowError(
      `Unknown format "unknown" was given to resize ${portraitSource.url}`
    )
  })

  it(`should fail when no height or width is given`, async () => {
    await expect(
      resizeResolver(portraitSource, {}, actions)
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
      actions
    )

    const url = new URL(`https://www.example.com${result!.src}`)
    const args = new URLSearchParams(url.searchParams.get(`a`) as string)
    expect(args.get(`fit`)).toBe(`crop`)
    expect(args.get(`crop`)).toBe(`top,left`)
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
        actions
      )

      const url = new URL(`https://www.example.com${result!.src}`)
      const args = new URLSearchParams(url.searchParams.get(`a`) as string)
      expect(url.searchParams.get(`u`)).toBe(source.url)
      expect(args.get(`w`)).toBe(`${expected.widthOnly[0]}`)
      expect(args.get(`h`)).toBe(`${expected.widthOnly[1]}`)
      expect(result.src).toBe(
        generateImageUrl(source, {
          width: expected.widthOnly[0],
          height: expected.widthOnly[1],
          format: `jpg`,
          quality: 75,
        })
      )
    })

    it(`should resize an image when height is given`, async () => {
      const result = await resizeResolver(
        source,
        {
          height: 300,
        },
        actions
      )

      const url = new URL(`https://www.example.com${result!.src}`)
      const args = new URLSearchParams(url.searchParams.get(`a`) as string)
      expect(url.searchParams.get(`u`)).toBe(source.url)
      expect(args.get(`w`)).toBe(`${expected.heightOnly[0]}`)
      expect(args.get(`h`)).toBe(`${expected.heightOnly[1]}`)
      expect(result.src).toBe(
        generateImageUrl(source, {
          width: expected.heightOnly[0],
          height: expected.heightOnly[1],
          format: `jpg`,
          quality: 75,
        })
      )
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
          actions
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
          actions
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
          actions
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
    const imageArgs = {
      format: `jpg`,
      width: 100,
      height: 160,
      quality: 75,
    }
    dispatchers.shouldDispatchLocalImageServiceJob.mockImplementationOnce(
      () => true
    )

    resizeResolver(portraitSource, { width: 100 }, actions)
    expect(actions.createJobV2).toHaveBeenCalledWith(
      expect.objectContaining({
        args: {
          contentDigest: `1`,
          url: portraitSource.url,
          filename: `dog-portrait.jpg`,
          ...imageArgs,
        },
        inputPaths: [],
        name: `IMAGE_CDN`,
        outputDir: expect.stringContaining(
          path.join(
            `public`,
            `_gatsby`,
            `image`,
            createContentDigest(portraitSource.url),
            createContentDigest(`w=100&h=160&fm=jpg&q=75`)
          )
        ),
      }),
      expect.any(Object)
    )
  })
})
