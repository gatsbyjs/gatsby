import {
  formatFromFilename,
  generateImageData,
  IGatsbyImageHelperArgs,
  IImage,
  getLowResolutionImageURL,
} from "../image-utils"

const generateImageSource = (
  file: string,
  width: number,
  height: number,
  format
): IImage => {
  return {
    src: `https://example.com/${file}/${width}/${height}/image.${format}`,
    width,
    height,
    format,
  }
}

const args: IGatsbyImageHelperArgs = {
  pluginName: `gatsby-plugin-fake`,
  filename: `afile.jpg`,
  generateImageSource,
  width: 400,
  layout: `fixed`,
  sourceMetadata: {
    width: 800,
    height: 600,
    format: `jpg`,
  },
  reporter: {
    warn: jest.fn(),
  },
}

const fullWidthArgs: IGatsbyImageHelperArgs = {
  ...args,
  sourceMetadata: {
    width: 2000,
    height: 1500,
    format: `jpg`,
  },
  layout: `fullWidth`,
}

const constrainedArgs: IGatsbyImageHelperArgs = {
  ...args,
  layout: `constrained`,
}

describe(`the image data helper`, () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  it(`throws if there's not a valid generateImageData function`, () => {
    const generateImageSource = `this should be a function`

    expect(() =>
      generateImageData(({
        ...args,
        generateImageSource,
      } as any) as IGatsbyImageHelperArgs)
    ).toThrow()
  })

  it(`warns if generateImageSource function returns invalid values`, () => {
    const generateImageSource = jest
      .fn()
      .mockReturnValue({ width: 100, height: 200, src: undefined })

    const myArgs = {
      ...args,
      generateImageSource,
    }

    generateImageData(myArgs)

    expect(args.reporter?.warn).toHaveBeenCalledWith(
      `[gatsby-plugin-fake] The resolver for image afile.jpg returned an invalid value.`
    )
    ;(args.reporter?.warn as jest.Mock).mockReset()

    generateImageSource.mockReturnValue({
      width: 100,
      height: undefined,
      src: `example`,
      format: `jpg`,
    })
    generateImageData(myArgs)

    expect(args.reporter?.warn).toHaveBeenCalledWith(
      `[gatsby-plugin-fake] The resolver for image afile.jpg returned an invalid value.`
    )
    ;(args.reporter?.warn as jest.Mock).mockReset()

    generateImageSource.mockReturnValue({
      width: undefined,
      height: 100,
      src: `example`,
      format: `jpg`,
    })
    generateImageData(myArgs)

    expect(args.reporter?.warn).toHaveBeenCalledWith(
      `[gatsby-plugin-fake] The resolver for image afile.jpg returned an invalid value.`
    )
    ;(args.reporter?.warn as jest.Mock).mockReset()

    generateImageSource.mockReturnValue({
      width: 100,
      height: 100,
      src: `example`,
      format: undefined,
    })
    generateImageData(myArgs)

    expect(args.reporter?.warn).toHaveBeenCalledWith(
      `[gatsby-plugin-fake] The resolver for image afile.jpg returned an invalid value.`
    )
    ;(args.reporter?.warn as jest.Mock).mockReset()
    generateImageSource.mockReturnValue({
      width: 100,
      height: 100,
      src: `example`,
      format: `jpg`,
    })
    generateImageData(myArgs)
    expect(args.reporter?.warn).not.toHaveBeenCalled()
  })

  it(`warns if there's no plugin name`, () => {
    generateImageData(({
      ...args,
      pluginName: undefined,
    } as any) as IGatsbyImageHelperArgs)
    expect(args.reporter?.warn).toHaveBeenCalledWith(
      `[gatsby-plugin-image] "generateImageData" was not passed a plugin name`
    )
  })

  it(`calls the generateImageSource function`, () => {
    const generateImageSource = jest.fn()
    generateImageData({ ...args, generateImageSource })
    expect(generateImageSource).toHaveBeenCalledWith(
      `afile.jpg`,
      800,
      600,
      `jpg`,
      undefined,
      undefined
    )
  })

  it(`calculates sizes for fixed`, () => {
    const data = generateImageData(args)
    expect(data.images.fallback?.sizes).toEqual(`400px`)
  })

  it(`calculates sizes for fullWidth`, () => {
    const data = generateImageData(fullWidthArgs)
    expect(data.images.fallback?.sizes).toEqual(`100vw`)
  })

  it(`calculates sizes for constrained`, () => {
    const data = generateImageData(constrainedArgs)
    expect(data.images.fallback?.sizes).toEqual(
      `(min-width: 400px) 400px, 100vw`
    )
  })

  it(`returns URLs for fixed`, () => {
    const data = generateImageData(args)
    expect(data?.images?.fallback?.src).toEqual(
      `https://example.com/afile.jpg/400/300/image.jpg`
    )

    expect(data.images?.sources?.[0].srcSet).toEqual(
      `https://example.com/afile.jpg/400/300/image.webp 400w,\nhttps://example.com/afile.jpg/800/600/image.webp 800w`
    )
  })

  it(`returns URLs for fullWidth`, () => {
    const data = generateImageData(fullWidthArgs)
    expect(data?.images?.fallback?.src).toEqual(
      `https://example.com/afile.jpg/750/563/image.jpg`
    )

    expect(data.images?.sources?.[0].srcSet)
      .toEqual(`https://example.com/afile.jpg/750/563/image.webp 750w,
https://example.com/afile.jpg/1080/810/image.webp 1080w,
https://example.com/afile.jpg/1366/1025/image.webp 1366w,
https://example.com/afile.jpg/1920/1440/image.webp 1920w`)
  })

  it(`converts to PNG if requested`, () => {
    const data = generateImageData({ ...args, formats: [`png`] })
    expect(data?.images?.fallback?.src).toEqual(
      `https://example.com/afile.jpg/400/300/image.png`
    )
  })

  it(`does not include sources if only jpg or png format is specified`, () => {
    let data = generateImageData({ ...args, formats: [`auto`] })
    expect(data.images?.sources?.length).toBe(0)

    data = generateImageData({ ...args, formats: [`png`] })
    expect(data.images?.sources?.length).toBe(0)

    data = generateImageData({ ...args, formats: [`jpg`] })
    expect(data.images?.sources?.length).toBe(0)
  })

  it(`does not include fallback if only webp format is specified`, () => {
    const data = generateImageData({ ...args, formats: [`webp`] })
    expect(data.images?.sources?.length).toBe(1)
    expect(data.images?.fallback).toBeUndefined()
  })

  it(`does not include fallback if only avif format is specified`, () => {
    const data = generateImageData({ ...args, formats: [`avif`] })
    expect(data.images?.sources?.length).toBe(1)
    expect(data.images?.fallback).toBeUndefined()
  })

  it(`generates the same output as the input format if output is auto`, () => {
    const sourceMetadata = {
      width: 800,
      height: 600,
      format: `jpg`,
    }

    let data = generateImageData({ ...args, formats: [`auto`] })
    expect(data?.images?.fallback?.src).toEqual(
      `https://example.com/afile.jpg/400/300/image.jpg`
    )
    expect(data.images?.sources?.length).toBe(0)

    data = generateImageData({
      ...args,
      sourceMetadata: { ...sourceMetadata, format: `png` },
      formats: [`auto`],
    })
    expect(data?.images?.fallback?.src).toEqual(
      `https://example.com/afile.jpg/400/300/image.png`
    )
    expect(data.images?.sources?.length).toBe(0)
  })

  it(`treats empty formats or empty string as auto`, () => {
    let data = generateImageData({ ...args, formats: [``] })
    expect(data?.images?.fallback?.src).toEqual(
      `https://example.com/afile.jpg/400/300/image.jpg`
    )
    expect(data.images?.sources?.length).toBe(0)

    data = generateImageData({ ...args, formats: [] })
    expect(data?.images?.fallback?.src).toEqual(
      `https://example.com/afile.jpg/400/300/image.jpg`
    )
    expect(data.images?.sources?.length).toBe(0)
  })
})

describe(`the helper utils`, () => {
  it(`gets file format from filename`, () => {
    const names = [
      `filename.jpg`,
      `filename.jpeg`,
      `filename.png`,
      `filename.heic`,
      `filename.jp`,
      `filename.jpgjpg`,
      `file.name.jpg`,
      `file.name.`,
      `filenamejpg`,
      `.jpg`,
    ]
    const expected = [
      `jpg`,
      `jpg`,
      `png`,
      `heic`,
      undefined,
      undefined,
      `jpg`,
      undefined,
      undefined,
      `jpg`,
    ]
    for (const idx in names) {
      const ext = formatFromFilename(names[idx])
      expect(ext).toBe(expected[idx])
    }
  })

  it(`gets a low-resolution image URL`, () => {
    const url = getLowResolutionImageURL(args)
    expect(url).toEqual(`https://example.com/afile.jpg/20/15/image.jpg`)
  })

  it(`gets a low-resolution image URL with correct aspect ratio`, () => {
    const url = getLowResolutionImageURL({
      ...fullWidthArgs,
      aspectRatio: 2 / 1,
    })
    expect(url).toEqual(`https://example.com/afile.jpg/20/10/image.jpg`)
  })
})
