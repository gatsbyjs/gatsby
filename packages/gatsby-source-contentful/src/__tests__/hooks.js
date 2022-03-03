import { useContentfulImage } from "../hooks"

jest.mock(`react`, () => {
  return {
    ...jest.requireActual(`react`),
    useMemo: jest.fn(v => v()),
  }
})

describe(`useContentfulImage`, () => {
  const consoleWarnSpy = jest.spyOn(console, `warn`)

  const image = { url: `//images.ctfassets.net/foo/bar/baz/image.jpg` }

  beforeEach(() => {
    consoleWarnSpy.mockClear()
  })

  test(`constrained: width and aspectRatio`, () => {
    const result = useContentfulImage({
      image,
      width: 600,
      aspectRatio: 1.778,
    })
    const desiredHeight = Math.floor(600 / 1.778)
    expect(result.layout).toBe(`constrained`)
    expect(result.height).toBe(desiredHeight)
    expect(result.width).toBe(600)
    expect(result.images.fallback.src).toContain(`h=${desiredHeight}`)
    expect(result).toMatchSnapshot()
    expect(consoleWarnSpy).toHaveBeenCalledTimes(0)
  })

  test(`constrained: width and height`, () => {
    const result = useContentfulImage({
      image,
      width: 600,
      height: 480,
    })
    expect(result.layout).toBe(`constrained`)
    expect(result.height).toBe(480)
    expect(result.width).toBe(600)
    expect(result.images.fallback.src).toContain(`h=480`)
    expect(result.images.fallback.src).toContain(`w=600`)
    expect(result.images.fallback.srcSet.split(`,`)).toHaveLength(3)
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
    expect(result.layout).toBe(`fixed`)
    expect(result.height).toBe(480)
    expect(result.width).toBe(600)
    expect(result.images.fallback.sizes).toContain(`600px`)
    expect(result.images.fallback.src).toContain(`h=480`)
    expect(result.images.fallback.src).toContain(`w=600`)
    expect(result.images.fallback.srcSet.split(`,`)).toHaveLength(1)
    expect(result).toMatchSnapshot()
    expect(consoleWarnSpy).toHaveBeenCalledTimes(0)
  })

  test(`fullWidth: aspect ratio`, () => {
    const result = useContentfulImage({
      image,
      layout: `fullWidth`,
      aspectRatio: 1.778,
    })
    expect(result.layout).toBe(`fullWidth`)
    expect(result.height).toBe(0.5625)
    expect(result.width).toBe(1)
    expect(result.images.fallback.sizes).toBe(`100vw`)
    expect(result.images.fallback.src).toContain(`h=2304`)
    expect(result.images.fallback.src).toContain(`w=4096`)
    expect(result.images.fallback.srcSet.split(`,`)).toHaveLength(12)
    expect(result).toMatchSnapshot()
  })

  test(`fullWidth: aspectRatio, maxWidth`, () => {
    const result = useContentfulImage({
      image,
      layout: `fullWidth`,
      aspectRatio: 1.778,
      maxWidth: 1280,
    })
    expect(result.layout).toBe(`fullWidth`)
    expect(result.height).toBe(0.5625)
    expect(result.width).toBe(1)
    expect(result.images.fallback.sizes).toBe(`100vw`)
    expect(result.images.fallback.src).toContain(`h=2304`)
    expect(result.images.fallback.src).toContain(`w=4096`)
    expect(result.images.fallback.srcSet.split(`,`)).toHaveLength(12)
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
    expect(result.layout).toBe(`fullWidth`)
    expect(result.height).toBe(0.75)
    expect(result.width).toBe(1)
    expect(result.images.fallback.sizes).toBe(`100vw`)
    expect(result.images.fallback.src).toContain(`h=600`)
    expect(result.images.fallback.src).toContain(`w=800`)
    expect(result.images.fallback.srcSet.split(`,`)).toHaveLength(4)
    expect(result).toMatchSnapshot()
  })
})
