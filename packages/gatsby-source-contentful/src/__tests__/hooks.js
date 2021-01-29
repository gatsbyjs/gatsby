import { useContentfulImage } from "../hooks"

describe(`useContentfulImage`, () => {
  const consoleWarnSpy = jest.spyOn(console, `warn`)

  const baseUrl = `https://images.ctfassets.net/foo/bar/baz/image.jpg`

  beforeEach(() => {
    consoleWarnSpy.mockClear()
  })
  test(`incomplete config`, () => {
    expect(() => useContentfulImage({ baseUrl })).toThrowError(
      `You must provide width and height for images where layout is constrained`
    )
    expect(consoleWarnSpy).toHaveBeenCalledTimes(0)
  })

  test(`constrained only width`, () => {
    expect(() => useContentfulImage({ baseUrl, width: 600 })).toThrowError(
      `You must provide width and height for images where layout is constrained`
    )
    expect(consoleWarnSpy).toHaveBeenCalledTimes(0)
  })

  test(`constrained: width and aspectRatio`, () => {
    const result = useContentfulImage({
      baseUrl,
      width: 600,
      aspectRatio: 1.778,
    })
    expect(result).toMatchSnapshot()
    expect(consoleWarnSpy).toHaveBeenCalledTimes(0)
  })

  test(`constrained: width and height`, () => {
    const result = useContentfulImage({
      baseUrl,
      width: 600,
      height: 480,
    })
    expect(result).toMatchSnapshot()
    expect(consoleWarnSpy).toHaveBeenCalledTimes(0)
  })

  test(`fixed: width and height`, () => {
    const result = useContentfulImage({
      layout: `fixed`,
      baseUrl,
      width: 600,
      height: 480,
    })
    expect(result).toMatchSnapshot()
    expect(consoleWarnSpy).toHaveBeenCalledTimes(0)
  })

  test(`fullWidth: aspect ratio`, () => {
    const result = useContentfulImage({
      baseUrl,
      layout: `fullWidth`,
      aspectRatio: 1.778,
    })
    expect(result).toMatchSnapshot()
  })

  test(`fullWidth: aspectRatio, maxWidth`, () => {
    const result = useContentfulImage({
      baseUrl,
      layout: `fullWidth`,
      aspectRatio: 1.778,
      maxWidth: 1280,
    })
    expect(result).toMatchSnapshot()
  })
  test(`fullWidth: width, height & maxWidth`, () => {
    const result = useContentfulImage({
      baseUrl,
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
