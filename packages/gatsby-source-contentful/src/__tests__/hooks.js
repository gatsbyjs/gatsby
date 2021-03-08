import { useContentfulImage } from "../hooks"

describe(`useContentfulImage`, () => {
  const consoleWarnSpy = jest.spyOn(console, `warn`)

  const image = { url: `https://images.ctfassets.net/foo/bar/baz/image.jpg` }

  beforeEach(() => {
    consoleWarnSpy.mockClear()
  })

  test(`constrained: width and aspectRatio`, () => {
    const result = useContentfulImage({
      image,
      width: 600,
      aspectRatio: 1.778,
    })
    expect(result).toMatchSnapshot()
    expect(consoleWarnSpy).toHaveBeenCalledTimes(0)
  })

  test(`constrained: width and height`, () => {
    const result = useContentfulImage({
      image,
      width: 600,
      height: 480,
    })
    expect(result).toMatchSnapshot()
    expect(consoleWarnSpy).toHaveBeenCalledTimes(0)
  })

  test(`fixed: width and height`, () => {
    const result = useContentfulImage({
      layout: `fixed`,
      image,
      width: 600,
      height: 480,
    })
    expect(result).toMatchSnapshot()
    expect(consoleWarnSpy).toHaveBeenCalledTimes(0)
  })

  test(`fullWidth: aspect ratio`, () => {
    const result = useContentfulImage({
      image,
      layout: `fullWidth`,
      aspectRatio: 1.778,
    })
    expect(result).toMatchSnapshot()
  })

  test(`fullWidth: aspectRatio, maxWidth`, () => {
    const result = useContentfulImage({
      image,
      layout: `fullWidth`,
      aspectRatio: 1.778,
      maxWidth: 1280,
    })
    expect(result).toMatchSnapshot()
  })
  test(`fullWidth: width, height & maxWidth`, () => {
    const result = useContentfulImage({
      image,
      layout: `fullWidth`,
      width: 800,
      height: 600,
      maxWidth: 1280,
    })
    expect(result).toMatchSnapshot()
  })
})

// export type Fit = "cover" | "fill" | "inside" | "outside" | "contain"

// export type Layout = "fixed" | "fullWidth" | "constrained"
// export type ImageFormat = "jpg" | "png" | "webp" | "avif" | "auto" | ""
