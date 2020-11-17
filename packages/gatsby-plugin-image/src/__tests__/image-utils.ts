import {
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
        src: `https://example.com/${file}?width=${width}&height=${height}`,
        width,
        height,
        format,
      }
    }
    const data = generateImageData({ ...args, generateImageSource })
    expect(data).toMatchInlineSnapshot(`
      Object {
        "height": 300,
        "images": Object {
          "fallback": Object {
            "sizes": "400px",
            "src": "https://example.com/afile.jpg?width=400&height=300",
            "srcSet": "https://example.com/afile.jpg?width=400&height=300 400w,
      https://example.com/afile.jpg?width=800&height=600 800w",
          },
          "sources": Array [
            Object {
              "sizes": "400px",
              "srcSet": "https://example.com/afile.jpg?width=400&height=300 400w,
      https://example.com/afile.jpg?width=800&height=600 800w",
              "type": "image/webp",
            },
          ],
        },
        "layout": "fixed",
        "width": 400,
      }
    `)
  })
})
