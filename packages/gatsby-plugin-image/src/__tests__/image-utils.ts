import {
  formatFromFilename,
  generateImageData,
  IGatsbyImageHelperArgs,
  IImage,
} from "../image-utils"

const args: IGatsbyImageHelperArgs = {
  pluginName: `gatsby-plugin-fake`,
  filename: `afile.jpg`,
  generateImageSource: jest.fn(),
  width: 400,
  sourceMetadata: {
    width: 800,
    height: 600,
    format: `jpg`,
  },
  reporter: {
    warn: jest.fn(),
  },
}

describe(`the image data helper`, () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  it(`throws if there's not a valid generateURL function`, () => {
    const generateImageSource = `this should be a function`

    expect(() =>
      generateImageData(({
        ...args,
        generateImageSource,
      } as any) as IGatsbyImageHelperArgs)
    ).toThrow()
  })

  it(`calls the generateImageSource function`, () => {
    generateImageData(args)
    expect(args.generateImageSource).toHaveBeenCalledWith(
      `afile.jpg`,
      800,
      600,
      `jpg`,
      undefined,
      undefined
    )
  })

  it(`returns URLs as generated`, () => {
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
    const data = generateImageData({ ...args, generateImageSource })
    expect(data?.images?.fallback?.src).toEqual(
      `https://example.com/afile.jpg/400/300/image.jpg`
    )

    expect(data.images?.sources?.[0].srcSet).toEqual(
      `https://example.com/afile.jpg/400/300/image.webp 400w,\nhttps://example.com/afile.jpg/800/600/image.webp 800w`
    )
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
})
